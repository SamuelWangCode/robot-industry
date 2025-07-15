<!-- src/views/LLM.vue -->
<template>
  <Row class="container" justify="center">
    <Col :xs="24" :md="20" :lg="16">   <!-- 居中、宽度适中 -->
      <Card dis-hover class="chat-box">
        <!-- AI 答复 -->
        <div class="answer" v-html="answer.replaceAll('\n','<br/>')" />

        <!-- 输入框 -->
        <div class="input-area">
          <Input
            v-model="question"
            type="textarea"
            :autosize="{ minRows:3, maxRows:4 }"
            placeholder="请输入您的问题…"
            @keyup.enter.exact="ask"
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
import { ref } from 'vue'
import { chat } from '@/services/deepseek'
import Md from 'markdown-it'
const md = Md({ html:false, linkify:true })
/* 后台固定专业 Prompt（不会显示在 UI 中） */
const SYSTEM_PROMPT = `
你是一位专门研究“人工智能对就业影响”的经济学专家。
回答需：
1. 结合机器人密度、替代效应、行业薪酬等统计指标；
2. 用简体中文，条理清晰，必要时列出要点；
3. 如不知道，诚实回答“暂无数据”而不是编造。
4. 回答要简洁明确清晰，尽可能不超过100字。`

const question = ref('')
const answer   = ref('（等待提问…）')
const loading  = ref(false)

async function ask () {
  if (!question.value.trim() || loading.value) return
  const q = question.value.trim()
  question.value = ''
  answer.value   = '⏳ 正在思考…'
  loading.value  = true
  try {
    const reply = await chat(
      [
        { role:'system', content: SYSTEM_PROMPT },
        { role:'user',   content: q }
      ],
      'deepseek-chat',
      { temperature: 0.6 }
    )
    answer.value = md.render(reply)
  } catch (e) {
    answer.value = '❌ 出错：' + e.message
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
