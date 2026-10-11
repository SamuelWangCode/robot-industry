<!-- src/views/LLM.vue -->
<template>
  <Row class="container" justify="center">
    <Col :xs="24" :md="20" :lg="16">   <!-- 居中、宽度适中 -->
      <Card dis-hover class="chat-box">
        <!-- AI 答复 -->
        <div class="answer" v-html="answer" />

        <!-- 输入框 -->
        <div class="input-area">
          <Input
            v-model="question"
            type="textarea"
            :autosize="{ minRows:3, maxRows:4 }"
            placeholder="请输入您的问题…"
            @keyup.enter.exact.prevent="ask"
          />
          <Button type="primary" :loading="loading" @click="ask">
            发送
          </Button>
        </div>
      </Card>
    </Col>
  </Row>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { chat } from '@/services/deepseek'
import Md from 'markdown-it'
const md = Md({ html:false, linkify:true })
let requestController
onBeforeUnmount(() => requestController?.abort())
// The original professional prompt is preserved in server/system-prompt.txt.
const question = ref('')
const answer   = ref('（等待提问…）')
const loading  = ref(false)

async function ask () {
  if (!question.value.trim() || loading.value) return
  const q = question.value.trim()
  question.value = ''
  answer.value   = '⏳ 正在思考…'
  loading.value  = true
  requestController = new AbortController()
  try {
    const reply = await chat(q, { signal: requestController.signal })
    answer.value = md.render(reply)
  } catch (e) {
    if (requestController.signal.aborted) return
    answer.value = md.render('❌ 出错：' + e.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container  { padding: 12px 24px 24px; }
.chat-box   { display:flex; flex-direction:column; height:100%; }
.answer     { flex:1; padding:16px 24px 24px; overflow-y:auto;line-height:auto;white-space:normal; }
.answer ul{ padding-left:1.4em; }
.answer li{ margin:4px 0; }
.input-area { display:flex; gap:8px; margin-top:12px; }
</style>
