<!-- src/views/Salary.vue -->
<template>
  <div class="page">
    <!-- 年份选择 -->
    <Row type="flex" justify="center" style="margin-bottom:16px">
      <Col :span="6">
        <Select v-model="year" transfer>
          <Option v-for="y in yearList" :key="y" :value="y">{{ y }} 年</Option>
        </Select>
      </Col>
    </Row>

    <Row :gutter="24">
      <!-- 图表 -->
      <Col :xs="24" :sm="24" :md="14" :lg="14" style="min-width:0">
        <Card dis-hover style="width:100%;min-width:0">
          <div ref="chartBox" style="width:100%;height:440px;min-width:0" />
        <div class="note">
          注：机器人对员工薪酬的影响是指机器人数量每增加1%，导致员工薪酬变化的百分比
        </div>
        </Card>
        <!-- 注释 -->
      </Col>

      <!-- 文字 -->
      <Col :xs="24" :sm="24" :md="10" :lg="10" style="min-width:0">
        <Card dis-hover>
          <p class="intro" v-html="comment" />
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer])

/* ---------- 维度 ---------- */
const LEVELS = ['管理层薪酬变化（%）', '普通员工薪酬变化（%）']   // 两个系列
const INDUSTRIES = [
  '电气机械和器材制造业',
  '塑料和化学制品',
  '工业机械与设备制造',
  '计算机、通信和其他电子设备制造业',
  '汽车制造业'
]
const COLOR_MANAGE = '#2458A6'
const COLOR_STAFF  = '#00B8F1'

/* ---------- 数据 ---------- */
const DATA = {
  2019: {
    m: [0.8, -0.2, 0.1, 0.5, 0.1],   // 管理层  对应 INDUSTRIES 顺序
    e: [0.9,  0.7, 0.1, 0.1, 0.2],   // 员工
    c: '2019年，机器人密度提升普遍带动薪酬上涨，但不同产业与岗位间收益分布差异显著：电气机械行业员工普遍受益，而塑料行业出现“员工涨、管理降”的反向分化。'
  },
  2020: {
    m: [-0.5, -0.3, 0.0, -0.4, 0.7],
    e: [-0.1,  0.5,-0.5,  0.5, 0.4],
    c: '2020年，机器人提升对行业影响分化显现：汽车行业管理层与员工薪酬同步上涨，电气机械行业则双双下滑，部分行业出现“管理层降薪、员工涨薪”的状况。'
  },
  2021: {
    m: [0.2, -0.2,-0.1, 0.4,-0.7],
    e: [-0.4, -0.4, 0.6,-1.5,-0.2],
    c: '2021年，不同行业对机器人密度上升的薪酬反应分化显著：汽车与塑料行业双双下调管理层薪酬，而普通员工在部分行业如工业机械中反而获得正向收益。'
  },
  2022: {
    m: [0.0, 0.1,-0.2, 0.3, 0.2],
    e: [-0.3, 0.0,-0.4, 0.2, 0.8],
    c: '2022年，机器人扩散对普通员工薪酬带来积极拉动，尤其在汽车与电子行业更为显著，而部分传统机械行业则出现分化，显示自动化红利开始下沉但不均衡释放。'
  },
  2023: {
    m: [0.7,-0.1, 0.2, 0.7, 0.2],
    e: [0.2, 0.8, 0.6, 0.2, 0.7],
    c: '2023年，机器人技术红利显著惠及普通员工，多个制造业子行业一线岗位薪资大幅上涨，管理层则整体温和上升，体现技术驱动下的薪酬重心下移。'
  },
  2024: {
    m: [-0.3,-0.3,-0.3, 1.3, 0.2],
    e: [ 0.0, 0.1, 0.8,-0.1, 0.0],
    c: '2024年，机器人密度上升背景下，工业设备制造业一线薪资显著增长，而计算机电子行业管理层薪酬激增，形成“技术型中高层”分化领涨的局面。'
  }
}

/* ---------- 组件状态 ---------- */
const yearList = Object.keys(DATA)
const year = ref('2019')
const chartBox = ref(null)
let chart

/* ---------- 绘图 ---------- */
function render () {
  const { m, e } = DATA[year.value]

  const series = [
    {
      name: LEVELS[0],
      type: 'bar',
      stack: 'total',
      barWidth: 18,
      data: m,
      itemStyle: { color: COLOR_MANAGE },
      label: {
        show: true,
        formatter: '{c}',
        distance: 4,
        color: '#fff'
      }
    },
    {
      name: LEVELS[1],
      type: 'bar',
      stack: 'total',
      barWidth: 18,
      data: e,
      itemStyle: { color: COLOR_STAFF },
      label: {
        show: true,
        formatter: '{c}',
        distance: 4,
        color: '#fff'
      }
    }
  ]

  chart.setOption({
    grid: { top: 90, left: 80, right: 80, bottom: 40 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { top: 40, data: LEVELS },
    xAxis: {
      type: 'value',
      min: -1.0,
      max: 1.0,
      interval: 0.2,
      axisLabel: { formatter: '{value}' },
      splitLine: { lineStyle: { color: '#e0e0e0' } },
      axisLine: { onZero: true }          // 0 轴竖线
    },
    yAxis: {
      type: 'category',
      data: INDUSTRIES,
      inverse: true,
      axisTick: { show: false }
    },
    series
  }, true)
}

watch(year, render)
onMounted(() => {
  chart = echarts.init(chartBox.value)
  render()
})

/* ---------- 解读 ---------- */
const comment = computed(() => DATA[year.value].c)
</script>

<style scoped>
.page  { padding: 12px 24px 24px; }
.intro{ font-size: 15px; line-height: 26px; }
.note {
  font-size: 16px;
  color: #666;
  margin-top: 8px;   /* 与 Card 保持 8px 间距 */
  margin-left: 10%;
}
</style>
