<template>
  <div class="page">
    <!-- 年份下拉 -->
    <Row justify="center" style="margin-bottom:16px">
      <Col :xs="12" :sm="8" :md="6">
        <Select v-model="year">
          <Option v-for="y in years" :key="y" :value="y">{{ y }} 年</Option>
        </Select>
      </Col>
    </Row>

    <!-- PDF 预览 -->
    <Card dis-hover>
      <!-- 用 iframe 方式嵌入；iOS/Safari 同样可用 -->
      <iframe
        :src="pdfSrc"
        width="100%"
        height="800"
        style="border:none"
      />
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

/* 可选年份 —— 不允许选重复，直接给常量数组 */
const years = ['2018','2019','2020','2021','2022','2023','2024']
const year  = ref('2024')                // 默认当年

/* 生成 pdf 访问地址 */
const base   = import.meta.env.BASE_URL
const pdfSrc = computed(() => `${base}reports/${year.value}.pdf`)
</script>

<style scoped>
.page { padding: 12px 24px 24px; }
</style>
