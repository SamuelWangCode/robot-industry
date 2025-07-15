<!-- src/views/DensityIndustry.vue -->
<template>
  <div class="page">
    <!-- 行业下拉 -->
    <Row type="flex" justify="center" style="margin-bottom:16px">
      <Col :span="8">
        <Select v-model="current" filterable transfer>
          <Option v-for="i in industryList" :key="i" :value="i">{{ i }}</Option>
        </Select>
      </Col>
    </Row>

    <Row :gutter="24">
      <Col :span="14">
        <Card dis-hover>
          <div ref="chartBox" style="height:400px" />
          <div class="note">
            注：机器人密度 = 机器人存量数量 ÷ 员工人数
          </div>
        </Card>
      </Col>
      <Col :span="10">
        <Card dis-hover>
          <p class="intro" v-html="comment" />
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import * as echarts from 'echarts/core'
import {
  BarChart, LineChart
} from 'echarts/charts'
import {
  TooltipComponent, LegendComponent, GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart, LineChart,
  TooltipComponent, LegendComponent, GridComponent,
  CanvasRenderer
])

/* =========  数据  ========= */
const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024]

const DATA = {
  '汽车制造业': {
    density:   [524, 650, 760, 843, 885, 1001, 1035],
    growth:    [27, 24, 17, 11, 5, 13, 3],
    comment:   `2018–2024年，上海汽车制造业机器人密度持续攀升，从524台增至1035台每万人，年均增幅超12%，智能化水平显著提升。`
  },
  '计算机、通信和其他电子设备制造业': {
    density: [66, 105, 142, 153, 228, 315, 433],
    growth:  [47, 59, 35, 8, 49, 38, 37],
    comment: `2018–2024年，计算机、通信和其他电子设备制造业的机器人密度从66台跃升至433台每万人，年均增速超过35%，自动化水平加速跃迁。`
  },
  '文教、工美、体育和娱乐用品制造业': {
    density: [53, 69, 99, 100, 262, 272, 360],
    growth:  [36, 30, 43, 1, 162, 4, 32],
    comment: `2018–2024年，文教工美体娱用品制造业机器人密度由53台提升至360台每万人，2022年起跃升明显，智能制造快速渗透传统轻工业。`
  },
  '食品、饮料和烟草制造业': {
    density: [74, 92, 127, 144, 178, 200, 239],
    growth:  [31, 24, 38, 13, 24, 12, 20],
    comment: `2018–2024年，食品、饮料和烟草制造业机器人密度从74台增至239台每万人，年均增长超20%，加速实现生产自动化升级。`
  },
  '金属制品业': {
    density: [53, 75, 96, 111, 138, 166, 199],
    growth:  [35, 42, 28, 16, 24, 20, 20],
    comment: `2018–2024年，金属制品业机器人密度从53台增至199台每万人，稳步提升近四倍，自动化进程持续推进。`
  },
  '黑色金属冶炼和压延加工业': {
    density: [96, 107, 119, 134, 147, 154, 167],
    growth:  [11, 11, 11, 13, 10, 5, 8],
    comment: `2018–2024年，黑色金属冶炼和压延加工业的机器人密度从96台增至167台每万人，体现出传统重工业向智能制造的持续转型。`
  },
  '工业机械与设备制造业': {
    density: [47, 63, 94, 109, 132, 136, 158],
    growth:  [42, 34, 49, 16, 21, 3, 16],
    comment: `2018–2024年，工业机械与设备制造业的机器人密度从每万人47台增长至158台，年均增速显著，自动化水平持续提升。`
  },
  '塑料和化学制品业': {
    density: [83, 94, 110, 114, 125, 135, 147],
    growth:  [15, 13, 17, 4, 10, 8, 9],
    comment: `2018–2024年，塑料和化学制品业的机器人密度从每万人83台上升至147台，显示出稳步推进的自动化发展趋势。`
  },
  '电气机械和器材制造业': {
    density: [29, 43, 58, 71, 90, 106, 127],
    growth:  [41, 48, 35, 22, 27, 18, 20],
    comment: `2018–2024年，电气机械和器材制造业机器人密度实现三倍跃升，从每万人29台激增至127台，成为推动该行业智能制造提速换挡的重要力量。`
  },
  '制造业总计': {
    density: [135, 171, 210, 231, 276, 319, 362],
    growth:  [25, 27, 23, 10, 19, 16, 13],
    comment: `2018至2024年，制造业机器人密度由135台跃升至362台/万人，翻近两番，智能化转型浪潮席卷全行业。`
  }
}

/* =========  组件状态  ========= */
const industryList = Object.keys(DATA)
const current = ref(industryList[0])
const chartBox = ref(null)
let chart

/* =========  渲染函数  ========= */
function render() {
  const { density, growth } = DATA[current.value]
    const maxDensityRaw = Math.max(...density)
    const y1Max = Math.ceil(maxDensityRaw / 50) * 50

    // 年增长率轴同理，向上到最近 10%
    const maxGrowthRaw = Math.max(...growth)
    const y2Max = Math.ceil(maxGrowthRaw / 10) * 10 || 10
  chart.setOption({
    grid: { top: 80, right: 40, bottom: 40, left: 80 },
    tooltip: { trigger: 'axis' },
    legend: { data: ['机器人密度', '年增长率'] },
    xAxis: { type: 'category', data: years },
    yAxis: [
  {   // 左：机器人密度
    type: 'value',
    name: '机器人密度（台/万人）',
    min: 0,
    max: y1Max,
    interval: 50,
    nameGap: 35,
    splitLine: {        // ✅ 这条保留网格线
      show: true,
      lineStyle: { color: '#ddd' }
    }
  },
  {   // 右：年增长率
    type: 'value',
    name: '年增长率',
    min: 0,
    max: y2Max,
    interval: 10,
    axisLabel: { formatter: '{value} %' },
    nameTextStyle: { padding: [0, 0, 0, 10] },
    splitLine: { show: false }   // ✅ 关掉右轴的 splitLine
  }
],
    series: [
    {
      name: '机器人密度',
      type: 'bar',
      data: density,
      barWidth: '45%',
      label: { show: true, position: 'top' }
    },
    {
      name: '年增长率',
      type: 'line',
      data: growth,
      yAxisIndex: 1,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      label: {
        show: true,
        position: 'top',
        formatter: p => p.value + '%'
      }
    }
  ]
  }, true)
}

/* =========  文字解读  ========= */
const comment = computed(() => DATA[current.value].comment)

/* =========  生命周期  ========= */
watch(current, render)
onMounted(() => {
  chart = echarts.init(chartBox.value)
  render()
})
</script>

<style scoped>
.page   { padding: 12px 24px 24px; }
.intro  { font-size: 22px; line-height: auto; }
.note {
  font-size: 16px;
  color: #666;
  margin-top: 8px;   /* 与 Card 保持 8px 间距 */
  margin-left: 10%;
}
</style>
