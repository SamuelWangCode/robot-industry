import axios from 'axios'

const instance = axios.create({
  baseURL : import.meta.env.VITE_DEEPSEEK_BASE,
  headers : {
    Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 30_000
})

/**
 * 非流式
 */
export function chat(messages, model = 'deepseek-chat', opts = {}) {
  return instance.post('/chat/completions', {
    model,
    messages,
    temperature: 0.7,
    ...opts
  }).then(r => r.data.choices[0].message.content)
}

/**
 * 流式 (SSE)
 */
export async function* chatStream(messages, model = 'deepseek-chat', opts = {}) {
  const resp = await instance.post(
    '/chat/completions',
    { model, messages, stream: true, ...opts },
    { responseType: 'stream' }          // node 环境
  )
  for await (const chunk of resp.data) {
    const lines = chunk.toString('utf8').split('\n').filter(Boolean)
    for (const l of lines) {
      if (l.startsWith('data: ') && l !== 'data: [DONE]') {
        const delta = JSON.parse(l.slice(6)).choices[0].delta.content
        if (delta) yield delta
      }
    }
  }
}
