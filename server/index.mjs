import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const API_PATH = '/robot-industry/api/'
const UPSTREAM = 'https://api.deepseek.com/chat/completions'
const MAX_BODY_BYTES = 16_384

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function json(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  })
  response.end(JSON.stringify(body))
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    request.on('data', chunk => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new HttpError(413, '问题过长，请缩短后再试'))
      } else {
        chunks.push(chunk)
      }
    })
    request.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(new HttpError(400, '请求格式不正确'))
      }
    })
    request.on('error', reject)
    request.on('aborted', () => reject(new HttpError(400, '请求已取消')))
  })
}

export function createApiServer({
  apiKey,
  model = 'deepseek-flash',
  systemPrompt,
  allowedOrigins = ['https://www.sh-ai-trend.com', 'https://sh-ai-trend.com'],
  fetchImpl = fetch,
  timeoutMs = 60_000,
  requestsPerMinute = 10,
  maxConcurrent = 4,
  now = Date.now,
} = {}) {
  if (!apiKey || !systemPrompt) throw new Error('DEEPSEEK_API_KEY and system prompt are required')
  let active = 0
  const buckets = new Map()

  const server = createServer(async (request, response) => {
    const path = request.url?.split('?')[0]
    if (path === `${API_PATH}health` && request.method === 'GET') {
      return json(response, 200, { status: 'ok', model })
    }
    if (path !== `${API_PATH}chat`) return json(response, 404, { error: '接口不存在' })
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'POST')
      return json(response, 405, { error: '请使用 POST 请求' })
    }
    if (request.headers.origin && !allowedOrigins.includes(request.headers.origin)) {
      return json(response, 403, { error: '请求来源不受支持' })
    }

    let acquired = false
    const controller = new AbortController()
    const cancel = () => { if (!response.writableEnded) controller.abort() }
    response.on('close', cancel)
    let timer
    try {
      if (request.headers['content-type']?.split(';')[0].trim() !== 'application/json') {
        throw new HttpError(415, '请使用 JSON 请求')
      }
      if (Number(request.headers['content-length']) > MAX_BODY_BYTES) {
        request.resume()
        throw new HttpError(413, '问题过长，请缩短后再试')
      }
      const body = await readBody(request)
      if (typeof body?.question !== 'string' || !body.question.trim()) {
        throw new HttpError(400, '请输入您的问题')
      }
      const question = body.question.trim()
      if (question.length > 4_000) throw new HttpError(413, '问题过长，请缩短后再试')

      // Only the loopback reverse proxy may supply the client address.
      const peer = request.socket.remoteAddress
      const loopback = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(peer)
      const address = loopback ? request.headers['x-real-ip'] || peer : peer
      const time = now()
      if (buckets.size >= 10_000) {
        for (const [ip, bucket] of buckets) {
          if (time >= bucket.resetAt) buckets.delete(ip)
        }
        if (buckets.size >= 10_000 && !buckets.has(address)) {
          throw new HttpError(503, '服务繁忙，请稍后再试')
        }
      }
      let bucket = buckets.get(address)
      if (!bucket || time >= bucket.resetAt) bucket = { count: 0, resetAt: time + 60_000 }
      if (bucket.count >= requestsPerMinute) {
        response.setHeader('Retry-After', Math.ceil((bucket.resetAt - time) / 1_000))
        throw new HttpError(429, '提问过于频繁，请稍后再试')
      }
      if (active >= maxConcurrent) throw new HttpError(503, '服务繁忙，请稍后再试')
      bucket.count += 1
      buckets.set(address, bucket)
      active += 1
      acquired = true
      timer = setTimeout(() => controller.abort(), timeoutMs)
      timer.unref()

      const upstream = await fetchImpl(UPSTREAM, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question },
          ],
          thinking: { type: 'disabled' },
          temperature: 0.6,
          max_tokens: 2_048,
        }),
        signal: controller.signal,
      })
      if (!upstream.ok) {
        // Do not return provider payloads, credentials, or internal stack traces.
        await upstream.body?.cancel()
        if (upstream.status === 429) throw new HttpError(429, '模型服务繁忙，请稍后再试')
        if (upstream.status === 402) throw new HttpError(503, '模型服务余额不足，请联系管理员')
        throw new HttpError(502, '模型服务暂时不可用，请稍后再试')
      }
      const result = await upstream.json()
      const content = result?.choices?.[0]?.message?.content
      if (typeof content !== 'string' || !content.trim()) {
        throw new HttpError(502, '模型未返回有效回答，请稍后再试')
      }
      if (!response.destroyed) json(response, 200, { content, model })
    } catch (error) {
      if (response.destroyed) return
      if (controller.signal.aborted) return json(response, 504, { error: '回答超时，请稍后再试' })
      json(response, error.status || 502, {
        error: error instanceof HttpError ? error.message : '服务暂时不可用，请稍后再试',
      })
    } finally {
      clearTimeout(timer)
      response.off('close', cancel)
      if (acquired) active -= 1
    }
  })
  server.requestTimeout = 10_000
  server.headersTimeout = 10_000
  return server
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createApiServer({
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: process.env.DEEPSEEK_MODEL || 'deepseek-flash',
    systemPrompt: readFileSync(new URL('./system-prompt.txt', import.meta.url), 'utf8'),
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'https://www.sh-ai-trend.com,https://sh-ai-trend.com').split(',').map(origin => origin.trim()),
  })
  const port = Number(process.env.PORT || 3001)
  server.listen(port, '127.0.0.1', () => console.log(`Robot industry API listening on 127.0.0.1:${port}`))
  for (const signal of ['SIGTERM', 'SIGINT']) {
    process.once(signal, () => {
      server.close(() => process.exit(0))
      setTimeout(() => process.exit(1), 65_000).unref()
    })
  }
}
