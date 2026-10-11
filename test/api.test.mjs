import test from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createApiServer } from '../server/index.mjs'

const secret = 'private-test-credential'
const prompt = '原有行业知识和回答要求'
const answer = () => Response.json({ choices: [{ message: { content: '测试回答' } }] })

async function start(t, options = {}) {
  const server = createApiServer({ apiKey: secret, systemPrompt: prompt, fetchImpl: async () => answer(), ...options })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(() => new Promise(resolve => {
    server.closeAllConnections()
    server.close(resolve)
  }))
  const base = `http://127.0.0.1:${server.address().port}/robot-industry/api/`
  return {
    base,
    ask: (body = { question: '你好' }, headers = {}) => fetch(`${base}chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://www.sh-ai-trend.com', ...headers },
      body: JSON.stringify(body),
    }),
  }
}

test('calls V4.1 Flash with the unchanged server prompt and hides credentials', async t => {
  let sent
  const api = await start(t, { fetchImpl: async (url, options) => {
    sent = { url, ...options, body: JSON.parse(options.body) }
    return answer()
  } })
  const response = await api.ask({ question: '  行业问题  ', model: 'unwanted-model', messages: [{ role: 'system', content: 'override' }] })
  assert.equal(response.status, 200)
  const body = await response.json()
  assert.deepEqual(body, { content: '测试回答', model: 'deepseek-flash' })
  assert.equal(sent.url, 'https://api.deepseek.com/chat/completions')
  assert.equal(sent.headers.Authorization, `Bearer ${secret}`)
  assert.equal(sent.body.model, 'deepseek-flash')
  assert.deepEqual(sent.body.messages, [{ role: 'system', content: prompt }, { role: 'user', content: '行业问题' }])
  assert.deepEqual(sent.body.thinking, { type: 'disabled' })
  assert.equal(sent.body.max_tokens, 2048)
  assert.ok(!JSON.stringify(body).includes(secret))
})

test('rejects malformed, oversized and foreign-origin requests before contacting DeepSeek', async t => {
  let calls = 0
  const api = await start(t, { fetchImpl: async () => { calls += 1; return answer() } })
  for (const body of [null, {}, { question: '  ' }, { question: 123 }]) {
    assert.equal((await api.ask(body)).status, 400)
  }
  assert.equal((await api.ask({ question: 'a'.repeat(4001) })).status, 413)
  assert.equal((await api.ask({ question: 'a'.repeat(17000) })).status, 413)
  assert.equal((await api.ask(undefined, { Origin: 'https://unrelated.example' })).status, 403)
  assert.equal((await api.ask(undefined, { 'Content-Type': 'text/plain' })).status, 415)
  assert.equal((await fetch(`${api.base}chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status, 400)
  assert.equal(calls, 0)
})

test('reports health and rejects unknown paths and methods', async t => {
  const api = await start(t)
  assert.deepEqual(await (await fetch(`${api.base}health`)).json(), { status: 'ok', model: 'deepseek-flash' })
  assert.equal((await fetch(`${api.base}missing`)).status, 404)
  const response = await fetch(`${api.base}chat`)
  assert.equal(response.status, 405)
  assert.equal(response.headers.get('allow'), 'POST')
})

for (const [upstreamStatus, expected] of [[401, 502], [402, 503], [429, 429], [500, 502]]) {
  test(`maps provider ${upstreamStatus} without leaking the provider payload`, async t => {
    const api = await start(t, { fetchImpl: async () => new Response(`Internal: ${secret}`, { status: upstreamStatus }) })
    const response = await api.ask()
    assert.equal(response.status, expected)
    assert.ok(!(await response.text()).includes(secret))
  })
}

test('rejects an empty model response', async t => {
  const api = await start(t, { fetchImpl: async () => Response.json({ choices: [] }) })
  assert.equal((await api.ask()).status, 502)
})

test('limits each client separately and resets the limit after one minute', async t => {
  let time = 0
  let calls = 0
  const api = await start(t, { requestsPerMinute: 1, now: () => time, fetchImpl: async () => { calls += 1; return answer() } })
  assert.equal((await api.ask()).status, 200)
  const limited = await api.ask()
  assert.equal(limited.status, 429)
  assert.equal(limited.headers.get('retry-after'), '60')
  assert.equal((await api.ask(undefined, { 'X-Real-IP': '192.0.2.2' })).status, 200)
  time = 60_000
  assert.equal((await api.ask()).status, 200)
  assert.equal(calls, 3)
})

test('caps concurrent paid requests and releases the slot afterward', async t => {
  let entered
  let release
  const started = new Promise(resolve => { entered = resolve })
  const blocked = new Promise(resolve => { release = resolve })
  const api = await start(t, { maxConcurrent: 1, fetchImpl: async () => { entered(); await blocked; return answer() } })
  const first = api.ask()
  await started
  assert.equal((await api.ask()).status, 503)
  release()
  assert.equal((await first).status, 200)
  assert.equal((await api.ask()).status, 200)
})

test('aborts a timed-out upstream request', async t => {
  let aborted = false
  const api = await start(t, { timeoutMs: 20, fetchImpl: async (_, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => { aborted = true; reject(new DOMException('aborted', 'AbortError')) }, { once: true })
  }) })
  assert.equal((await api.ask()).status, 504)
  assert.equal(aborted, true)
})
