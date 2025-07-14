<template>
  <div class="page">
    <!-- 年份下拉 -->
    <Row type="flex" justify="center" :gutter="16" style="margin-bottom:16px">
      <Col :span="6">
        <Select v-model="y1">
          <Option v-for="y in years" :key="y" :value="y">{{ y }} 年</Option>
        </Select>
      </Col>
      <Col :span="6">
        <Select v-model="y2">
          <Option v-for="y in years" :key="y" :value="y">{{ y }} 年</Option>
        </Select>
      </Col>
    </Row>

    <Row :gutter="24">
      <!-- 图表 -->
      <Col :span="14">
        <Card dis-hover>
          <div ref="chartBox" style="height:600px;width:100%" />
          <div class="note">
            注：增长比例 = ({{ y2 }} − {{ y1 }}) ÷ {{ y1 }} × 100%
          </div>
        </Card>
      </Col>

      <!-- 右侧文字 -->
      <Col :span="10">
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
import { BarChart, LineChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, LineChart, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer])

/* 行业固定顺序 */
const INDUSTRIES = [
  '汽车制造业',
  '计算机、通信和其他电子设备制造业',
  '文教、工美、体育和娱乐用品制造业',
  '食品、饮料和烟草制造业',
  '金属制品业',
  '黑色金属冶炼和压延加工业',
  '工业机械与设备制造业',
  '塑料和化学制品业',
  '电气机械和器材制造业',
  '制造业总计'
]

/* 原始密度数据 */
const RAW = {
  2018:[524,  66,  53,  74,  53,  96,  47,  83,  29, 135],
  2019:[650, 105,  69,  92,  75, 107,  63,  94,  43, 171],
  2020:[760, 142,  99, 127,  96, 119,  94, 110,  58, 210],
  2021:[843, 153, 100, 144, 111, 134, 109, 114,  71, 231],
  2022:[885, 228, 262, 178, 138, 147, 132, 125,  90, 276],
  2023:[1001,315, 272, 200, 166, 154, 136, 135, 106, 319],
  2024:[1035,433, 360, 239, 199, 167, 158, 147, 127, 362]
}

const years = Object.keys(RAW)      // ['2018' ...]
const y1 = ref('2018')
const y2 = ref('2019')

const chartBox = ref(null)
let chart

/* 构建 option */
function buildOption() {
  const a = RAW[y1.value]
  const b = RAW[y2.value]
  const inc = a.map((v,i)=> +(((b[i]-v)/v)*100).toFixed(1))   // 一位小数

  return {
    grid: { top: 80, left: 80, right: 60, bottom: 130 },
    tooltip:{ trigger:'axis', axisPointer:{ type:'shadow' } },
    legend :{ top: 40, data:[y1.value, y2.value, '增长比例'] },
    xAxis  :{
      type:'category',
      data: INDUSTRIES,
      axisLabel:{ interval:0, rotate:30 }
    },
    yAxis:[
      {                       // 左：密度
        type:'value',
        name:'机器人密度（台/万人）',
        splitLine:{ lineStyle:{ color:'#e0e0e0' } }
      },
      {                       // 右：百分比（只刻度，不网格）
        type:'value',
        name:'增长比例',
        axisLabel:{ formatter:'{value} %' },
        splitLine:{ show:false },
        axisTick :{ show:false },
        axisLine :{ show:false }
      }
    ],
    series:[
      {
        name:y1.value,
        type:'bar',
        data:a,
        barWidth:14,
        itemStyle:{ color:'#174EA6' },
        label:{ show:true, position:'top' }
      },
      {
        name:y2.value,
        type:'bar',
        data:b,
        barWidth:14,
        itemStyle:{ color:'#00A0F3' },
        label:{ show:true, position:'top' }
      },
      {
        name:'增长比例',
        type:'line',
        data:inc,
        yAxisIndex:1,
        smooth:true,
        symbol:'circle',
        symbolSize:8,
        lineStyle:{ color:'#808080' },
        label:{ show:true, formatter:p=>`${p.value}%` }
      }
    ]
  }
}

/* 渲染 */
function render() {
  chart.setOption(buildOption(), true)
}
watch([y1, y2], render)

onMounted(()=>{
  chart = echarts.init(chartBox.value)
  render()
})

/* 文字解读：简单动态生成 */
const comment = computed(()=>{
  const diff = y2.value - y1.value
  const dir  = diff > 0 ? '增加' : (diff < 0 ? '减少' : '保持不变')
  return `
    <strong>${y1.value}-${y2.value} 年比较</strong>：<br/>
    10 大制造业中，机器人密度${dir}趋势如图所示。其中 <em>汽车制造业</em> 与
    <em>电子设备制造业</em> 绝对密度最高；<em>文教工美行业</em>
    则在近年呈现最快增速。`
})
</script>

<style scoped>
.page   { padding:12px 24px 24px; }
.intro  { font-size:15px; line-height:26px; }
.note   { font-size:12px; color:#666; margin:8px 0 0 6px; }
</style>
