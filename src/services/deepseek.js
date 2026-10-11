// Credentials and the model configuration live exclusively on the server.
export async function chat(question, { signal } = {}) {
  const controller = new AbortController()
  const cancel = () => controller.abort()
  if (signal?.aborted) controller.abort()
  signal?.addEventListener('abort', cancel, { once: true })
  const timer = setTimeout(cancel, 65_000)
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
      signal: controller.signal,
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(data?.error || '服务暂时不可用，请稍后再试')
    }
    if (typeof data?.content !== 'string' || !data.content.trim()) {
      throw new Error('模型未返回有效回答，请稍后再试')
    }
    return data.content
  } catch (error) {
    if (controller.signal.aborted && !signal?.aborted) {
      throw new Error('回答超时，请稍后再试')
    }
    throw error
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', cancel)
  }
}
