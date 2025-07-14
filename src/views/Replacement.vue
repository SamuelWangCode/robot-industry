<!-- src/views/Replacement.vue -->
<template>
  <div class="page">
    <!-- 年份下拉 -->
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
          <div ref="chartBox" style="width:100%;height:420px;min-width:0" />
          <div class="note">
            注：机器人对就业的替代效应是指机器人数量每增加1%，导致就业需求量变化的百分比
          </div>
        </Card>
      </Col>

      <!-- 文字 -->
      <Col :xs="24" :sm="24" :md="10" :lg="10" style="min-width:0">
        <Card dis-hover style="width:100%;min-width:0">
          <p class="intro" v-html="comment" />
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer])

/* ---------- 数据 ---------- */
const LEVELS = ['研究生', '本科', '大专', '高中及以下']
const INDUSTRIES = [
  '制造业总计',
  '电气机械和器材制造业',
  '塑料和化学制品业',
  '工业机械与设备制造业',
  '黑色金属冶炼和压延加工业',
  '金属制品业',
  '食品、饮料和烟草制造业',
  '文教、工美、体育和娱乐用品制造业',
  '计算机、通信和其他电子设备制造业',
  '汽车制造业'
]
const COLORS = ['#4B7BEC','#3E92CC','#17BEBB','#00B894','#82C341',
                '#BD4B4B','#F09A3E','#9B59B6','#34495E','#1B264F']

/* year → { series: { industry: [4 值] }, comment } */
const DATA = {
  2019: {
    s: {
      '汽车制造业':                      [ 0.1, -0.3,  0.6, -1.3],
      '计算机、通信和其他电子设备制造业': [-0.1, -0.5,  0.0, -0.2],
      '工业机械与设备制造业':            [ 0.1, -1.0, -0.2, -1.0],
      '塑料和化学制品业':                [ 0.1, -0.6, -0.5, -0.9],
      '电气机械和器材制造业':            [ 0.7, -0.6, -1.0, -0.8]
    },
    c: '2019年，上海制造业机器人密度提升对低学历劳动力造成明显冲击，高中及以下学历就业普遍下降，而部分行业（如汽车制造业）对大专及研究生人才的需求开始显现出结构性上升。'
  },
  2020: {
    s: {
      '汽车制造业':                      [ 0.4, -0.5, -0.2, -0.2],
      '计算机、通信和其他电子设备制造业': [ 0.0, -0.5, -0.1, -0.3],
      '工业机械与设备制造业':            [ 0.2,  0.0, -0.3, -0.4],
      '塑料和化学制品业':                [ 0.0, -0.3, -0.3, -1.1],
      '电气机械和器材制造业':            [ 0.1, -0.5, -0.4, -0.5]
    },
    c: '2020年，随着机器人应用继续深化，高学历人才优势扩大，研究生在汽车及工业机械行业的就业需求上升，而低学历劳动者在多个制造领域持续面临替代性冲击，尤其以塑料和化学制品业影响最为显著。'
  },
  2021: {
    s: {
      '汽车制造业':                      [ 0.1, -0.5, -0.7,  0.0],
      '计算机、通信和其他电子设备制造业': [ 0.1, -0.3, -0.9, -0.5],
      '工业机械与设备制造业':            [ 0.3, -0.3,  0.3,  0.0],
      '塑料和化学制品业':                [ 0.0, -0.4, -0.4,  0.0],
      '电气机械和器材制造业':            [ 0.2, -0.4, -0.5, -0.3]
    },
    c: '2021年，工业机器人对学历结构的影响更趋分化，工业机械制造业对研究生和大专层次出现“双向利好”，而计算机电子行业则持续压缩本专科及以下学历岗位，呈现出智能制造对高技能人才的结构性偏好。'
  },
  2022: {
    s: {
      '汽车制造业':                      [ 0.1, -0.4, -0.3, -0.1],
      '计算机、通信和其他电子设备制造业': [ 0.1, -0.5,  0.0,  0.1],
      '工业机械与设备制造业':            [ 0.0, -0.6, -0.5, -0.3],
      '塑料和化学制品业':                [ 0.0, -0.5, -0.5, -0.5],
      '电气机械和器材制造业':            [-0.2, -0.5, -0.2, -0.1]
    },
    c: '2022年，机器人密度提升对中低学历冲击持续扩大，本科及以下学历在各行业全面负增长，而研究生就业保持稳定，显示智能制造对高技能人才的偏好日益凸显。'
  },
  2023: {
    s: {
      '汽车制造业':                      [ 0.1,  0.0, -0.4, -0.4],
      '计算机、通信和其他电子设备制造业': [ 0.0, -0.4, -0.3, -0.3],
      '工业机械与设备制造业':            [ 0.0,  0.6, -0.3, -0.5],
      '塑料和化学制品业':                [ 0.1, -0.4, -0.4, -0.8],
      '电气机械和器材制造业':            [ 0.4, -1.4, -0.8, -0.7]
    },
    c: '2023年，机器人密度提升对低学历群体（大专及以下）冲击持续加剧，而研究生在多个行业实现全面正向增长，特别是在电气机械等新兴领域呈现强劲吸纳力，显示高技能人才在智能制造浪潮中愈发凸显竞争优势。'
  },
  2024: {
    s: {
      '汽车制造业':                      [ 0.0,  0.1,  0.0, -0.4],
      '计算机、通信和其他电子设备制造业': [ 0.1, -0.4, -0.3, -0.3],
      '工业机械与设备制造业':            [ 0.2, -0.8, -0.9,  0.0],
      '塑料和化学制品业':                [ 0.0, -0.4, -0.1, -0.4],
      '电气机械和器材制造业':            [ 0.0, -0.1, -0.2, -0.2]
    },
    c: '2024年，机器人密度提升继续压缩中低学历岗位空间，本科及大专群体在工业机械等核心制造行业受挤出效应明显，而研究生则在高技术环节保持稳步上升，反映出制造业智能升级对人才梯度提出更高要求。'
  }
}

/* ---------- 组件状态 ---------- */
const yearList = Object.keys(DATA)
const year = ref('2019')
const chartBox = ref(null)
let chart

/* ---------- 渲染 ---------- */
function render () {
  const { s } = DATA[year.value]

  const series = INDUSTRIES.filter(i => s[i]).map((ind, idx) => ({
    name: ind,
    type: 'bar',
    barGap: '30%',
    barWidth: 15,
    itemStyle: { color: COLORS[idx % COLORS.length] },
    data: s[ind].map(v => ({
      value: v,
      label: {
        show: true,
        position: v >= 0 ? 'top' : 'bottom',
        distance: 5,
        formatter: v
      }
    }))
  }))

  // y 轴取 -1.0 ~ 0.6 区间
  chart.setOption({
    grid: { top: 80, left: 40, right: 40, bottom: 40 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { top: 40, data: series.map(s => s.name) },
    xAxis: { type: 'category', data: LEVELS },
    yAxis: {
      type: 'value',
      min: -1.5,
      max: 0.8,
      interval: 0.2,
      axisLabel: { formatter: '{value}' },
      splitLine: { lineStyle: { color: '#eee' } }
    },
    series
  }, true)
}

watch(year, render)

onMounted(() => {
  chart = echarts.init(chartBox.value)
  render()
})

/* ---------- 文字解读 ---------- */
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
