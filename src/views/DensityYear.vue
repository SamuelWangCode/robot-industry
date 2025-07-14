<!-- src/views/DensityYear.vue -->
<template>
  <div class="page">
    <!-- 年份选择 -->
    <Row type="flex" justify="center" style="margin-bottom: 16px">
      <Col :span="6">
        <Select v-model="current" transfer>
          <Option v-for="y in yearList" :key="y" :value="y">{{ y }} 年</Option>
        </Select>
      </Col>
    </Row>

    <Row :gutter="24">
      <Col :span="14">
        <Card dis-hover>
          <div ref="chartBox" style="height: 420px" />
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
  BarChart
} from 'echarts/charts'
import {
  TooltipComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, TooltipComponent, GridComponent, CanvasRenderer])

/* =========== 数据 =========== */
const DATA = {
  2018: {
    density: {
      '汽车制造业': 524,
      '计算机、通信和其他电子设备制造业': 66,
      '文教、工美、体育和娱乐用品制造业': 53,
      '食品、饮料和烟草制造业': 74,
      '金属制品业': 53,
      '黑色金属冶炼和压延加工业': 96,
      '工业机械与设备制造业': 47,
      '塑料和化学制品业': 83,
      '电气机械和器材制造业': 29,
      '制造业总计': 135
    },
    comment:
      '2018年，上海工业机器人密度在各制造门类之间差异显著，汽车制造业以524台/万人遥遥领先，远高于制造业平均水平135台，显示出机器人优先部署在自动化潜力大、流程标准化程度高的行业。'
  },
  2019: {
    density: {
      '汽车制造业': 650,
      '计算机、通信和其他电子设备制造业': 105,
      '文教、工美、体育和娱乐用品制造业': 69,
      '食品、饮料和烟草制造业': 92,
      '金属制品业': 75,
      '黑色金属冶炼和压延加工业': 107,
      '工业机械与设备制造业': 63,
      '塑料和化学制品业': 94,
      '电气机械和器材制造业': 43,
      '制造业总计': 171
    },
    comment:
      '2019年，上海制造业机器人密度上升至171台/万人，其中汽车、计算机电子等行业均突破百台，表明工业机器人正在向装配复杂度高、劳动强度大的细分领域持续渗透。'
  },
  2020: {
    density: {
      '汽车制造业': 760,
      '计算机、通信和其他电子设备制造业': 142,
      '文教、工美、体育和娱乐用品制造业': 99,
      '食品、饮料和烟草制造业': 127,
      '金属制品业': 96,
      '黑色金属冶炼和压延加工业': 119,
      '工业机械与设备制造业': 94,
      '塑料和化学制品业': 110,
      '电气机械和器材制造业': 58,
      '制造业总计': 210
    },
    comment:
      '2020年，上海制造业机器人密度首次突破200台/万人大关，其中汽车制造业以760台继续领跑，电子设备与食品行业加速追赶。'
  },
  2021: {
    density: {
      '汽车制造业': 843,
      '计算机、通信和其他电子设备制造业': 153,
      '文教、工美、体育和娱乐用品制造业': 100,
      '食品、饮料和烟草制造业': 144,
      '金属制品业': 111,
      '黑色金属冶炼和压延加工业': 134,
      '工业机械与设备制造业': 109,
      '塑料和化学制品业': 114,
      '电气机械和器材制造业': 71,
      '制造业总计': 231
    },
    comment:
      '2021年，上海制造业机器人密度稳步提升至231台/万人，汽车、电子、食品三大行业继续领跑，工业机械和金属制品行业也加快智能化转型步伐。'
  },
  2022: {
    density: {
      '汽车制造业': 885,
      '计算机、通信和其他电子设备制造业': 228,
      '文教、工美、体育和娱乐用品制造业': 262,
      '食品、饮料和烟草制造业': 178,
      '金属制品业': 138,
      '黑色金属冶炼和压延加工业': 147,
      '工业机械与设备制造业': 132,
      '塑料和化学制品业': 125,
      '电气机械和器材制造业': 90,
      '制造业总计': 276
    },
    comment:
      '2022年，上海制造业机器人密度跃升至276台/万人，文教工美行业异军突起，首次突破电子制造，成为除汽车行业外自动化增长最快的领域。'
  },
  2023: {
    density: {
      '汽车制造业': 1001,
      '计算机、通信和其他电子设备制造业': 315,
      '文教、工美、体育和娱乐用品制造业': 272,
      '食品、饮料和烟草制造业': 200,
      '金属制品业': 166,
      '黑色金属冶炼和压延加工业': 154,
      '工业机械与设备制造业': 136,
      '塑料和化学制品业': 135,
      '电气机械和器材制造业': 106,
      '制造业总计': 319
    },
    comment:
      '2023年，上海制造业机器人密度攀升至319台/万人，汽车行业率先突破千台大关，电子与文教行业形成自动化双高地，制造业加速向智能化跃迁。'
  },
  2024: {
    density: {
      '汽车制造业': 1035,
      '计算机、通信和其他电子设备制造业': 433,
      '文教、工美、体育和娱乐用品制造业': 360,
      '食品、饮料和烟草制造业': 239,
      '金属制品业': 199,
      '黑色金属冶炼和压延加工业': 167,
      '工业机械与设备制造业': 158,
      '塑料和化学制品业': 147,
      '电气机械和器材制造业': 127,
      '制造业总计': 362
    },
    comment:
      '2024年，上海制造业机器人密度跃升至362台/万人，其中汽车制造业突破千台、计算机行业超越400台、文教体育类首次超越化工行业，显示智能制造全面渗透、多点开花的新格局。'
  }
}

/* ===========  状态  =========== */
const yearList = Object.keys(DATA)
const current = ref(yearList[0])  // 默认 2018
const chartBox = ref(null)
let chart

/* ===========  图表绘制  =========== */
function render() {
  const ORDER = [
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
    const { density } = DATA[current.value]
    const names  = ORDER
    const values = ORDER.map(k => density[k] ?? 0)
  // x 轴最大值向上到 50 的倍数
  const maxVal = Math.ceil(Math.max(...values) / 50) * 50

  chart.setOption({
    grid: { top: 10, left: 210, right: 40, bottom: 40 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'value',
      min: 0,
      max: maxVal,
      splitNumber: 5,
      splitLine: { lineStyle: { color: '#eee' } }
    },
    yAxis: {
      type: 'category',
      data: names,
      inverse: true,             // 让最大值在最上面
      axisTick: { show: false }
    },
    series: [
      {
        type: 'bar',
        data: values,
        showBackground: true,
        backgroundStyle: { color: '#f0f0f0' },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}'
        },
        itemStyle: {
          color: '#4B7BEC'
        },
        barWidth: 14
      }
    ]
  }, true)
}

watch(current, render)

onMounted(() => {
  chart = echarts.init(chartBox.value)
  render()
})

/* ===========  文字解读  =========== */
const comment = computed(() => DATA[current.value].comment)
</script>

<style scoped>
.page  { padding: 12px 24px 24px; }
.intro { font-size: 15px; line-height: 26px; }
.note {
  font-size: 16px;
  color: #666;
  margin-top: 8px;   /* 与 Card 保持 8px 间距 */
  margin-left: 10%;
}
</style>
