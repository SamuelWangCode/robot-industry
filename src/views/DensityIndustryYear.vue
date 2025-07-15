<template>
  <div class="page">
    <!-- 年份选择 -->
    <Row type="flex" justify="center" :gutter="16" style="margin-bottom:16px">
      <Col :span="6">
        <Select v-model="y1" @on-change="ensureOrder('left')">
          <Option v-for="y in years" :key="y" :value="y"
                  :disabled="y===y2">{{ y }} 年</Option>
        </Select>
      </Col>
      <Col :span="6">
        <Select v-model="y2" @on-change="ensureOrder('right')">
          <Option v-for="y in years" :key="y" :value="y"
                  :disabled="y===y1">{{ y }} 年</Option>
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

/* ------- 行业顺序 & 数据 ------- */
const INDUSTRIES=[ '汽车制造业','计算机、通信和其他电子设备制造业','文教、工美、体育和娱乐用品制造业','食品、饮料和烟草制造业','金属制品业','黑色金属冶炼和压延加工业','工业机械与设备制造业','塑料和化学制品业','电气机械和器材制造业','制造业总计']
const RAW={2018:[524,66,53,74,53,96,47,83,29,135],2019:[650,105,69,92,75,107,63,94,43,171],2020:[760,142,99,127,96,119,94,110,58,210],2021:[843,153,100,144,111,134,109,114,71,231],2022:[885,228,262,178,138,147,132,125,90,276],2023:[1001,315,272,200,166,154,136,135,106,319],2024:[1035,433,360,239,199,167,158,147,127,362]}
const years=Object.keys(RAW)            // ['2018'…'2024']

/* ------- 21 句解读 ------- */
const EXPLAINS={
  '2018-2019':'2018–2019年制造业机器人密度整体年增27%，其中计算机制造业（+59%）、电气机械制造业（+48%）、金属制品业（+42%）增长最快，展现出新兴与中游制造环节的自动化加速趋势；而冶炼加工业（+11%）和塑料制品业（+13%）增速较缓。',
  '2018-2020':'2018–2020年制造业机器人密度年均增长25%，其中电子设备制造业（47%）、工业设备（41%）和文教娱乐行业（37%）智能化进程迅猛，汽车制造虽密度高但仍保持年增20%的稳步升级，整体呈现多点突破、全面提速态势。',
  '2018-2021':'2018–2021年制造业机器人密度年均增长20%，其中电气机械（年增35%）、工业机械与设备（32%）及计算机电子制造（32%）三大行业领跑智能化升级，而汽车制造虽增长17%，但增长动能相对趋缓。',
  '2018-2022':'2018–2022年制造业机器人密度翻倍增长达20%，其中“文教娱乐用品制造业”以年均49%的惊人速度领跑，凸显新兴行业智能化跃升，而传统“汽车制造业”增长相对温和，反映其智能转型趋于成熟。',
  '2018-2023':'2018–2023年制造业机器人密度年均增长19%，其中“文教娱乐用品制造业”以39%的年复合增速位居第一，显示出该行业智能化转型的爆发式趋势；相较之下，“塑料和化学制品业”增速仅10%，呈现出较大的提升潜力。',
  '2018-2024':'2018–2024年制造业机器人密度年均增长18%，其中“文教工美娱乐”与“计算机电子设备制造业”以38%和37%的年复合增长率遥遥领先，制造业整体智能化进程显著加快，智能技术渗透正从传统行业向多元领域拓展。',
  '2019-2020':'2019–2020年制造业机器人密度年均增长达23%，其中工业机械与设备（年增49%）、文教娱乐用品（43%）与食品饮料行业（38%）表现亮眼，引领智能化浪潮，而汽车制造业虽基数较高，增长仍达17%，展现持续升级动能。',
  '2019-2021':'2019–2021年制造业机器人密度年增16%，其中工业机械、食品加工和电气设备制造年均增速分别达32%、25%和28%，领跑行业升级，而传统大类如汽车制造虽维持14%增幅，却显示出智能化趋于成熟、增长放缓的趋势。',
  '2019-2022':'2019–2022年制造业机器人密度年均增长17%，其中文教娱乐用品制造业以惊人的56%年增率领跑，展现出新兴领域智能化浪潮汹涌，而传统汽车、黑色金属等行业增速放缓，转向深度优化与成熟发展阶段。',
  '2019-2023':'2019–2023年制造业机器人密度年均增长达17%，其中“文教娱乐用品制造业”增长最为迅猛（41%），而“塑料和化学制品业”增速仅9%，表明部分行业对智能制造的投入仍有较大提升空间。',
  '2019-2024':'2019–2024年制造业整体机器人密度年均增长16%，其中“文教工美娱乐制造业”与“计算机电子制造业”分别以39%和33%的年复合增速显著领先，传统领域如冶炼业、塑料制品业增速仅为9%，显示出新兴高附加值产业正引领智能化转型。',
  '2020-2021':'2020–2021年制造业机器人密度年增10%，其中电气机械和器材制造业以22%的年增率领跑，食品、金属及工业机械制造均保持13%–16%的稳健提升，而文教娱乐用品制造业几近停滞，仅增长1%，显示出行业间智能化步伐分化明显。',
  '2020-2022':'2020–2022年制造业机器人密度年均增长15%，其中“文教、工美、体育和娱乐用品制造业”机器人密度飙升63%，领跑各行业，反映出劳动密集型行业正在加速迈向自动化转型。',
  '2020-2023':'2020–2023年制造业机器人密度年均增长15%，其中“文教娱乐制造业”增长最快（40%），而“塑料和化学制品业”增长最慢，仅为7%，行业间自动化推进速度差异显著。',
  '2020-2024':'2020–2024年制造业机器人密度年均增长15%，其中“文教工美体育娱乐用品制造业”以38%居首，显示出新兴消费品制造对自动化的旺盛需求，而传统行业如汽车制造年均增速仅8%，表明其自动化已趋饱和。',
  '2021-2022':'2021–2022年制造业机器人密度整体年增19%，其中“文教娱乐用品制造业”机器人密度激增162%，遥遥领先，成为智能制造扩张最快的行业，而“汽车制造业”仅增长5%，表明其智能化已趋于稳定饱和。',
  '2021-2023':'2021–2023年制造业机器人密度年均增长18%，其中“文教工美娱乐”行业以65%的复合增速居首，远超整体水平，显示出非传统制造业对智能化的快速采纳和转型意愿。',
  '2021-2024':'2021–2024年制造业机器人密度年均增长率为16%，其中“文教工美体育娱乐用品制造业”以53%复合增速领跑，远超传统制造业如汽车（7%）与冶金（8%）行业，凸显新兴轻工业在智能化转型中的加速度与活力。',
  '2022-2023':'2022–2023年制造业机器人密度整体增长16%，其中“计算机通信电子制造业”以38%的复合增速领跑，而“文教娱乐”等行业增速趋缓，仅为4%，智能化扩张节奏出现分化。',
  '2022-2024':'2022–2024年制造业机器人密度整体年均增长率为15%，其中计算机制造业以38%的复合增速遥遥领先，传统行业如汽车制造（8%）与冶金（7%）增速缓慢，体现出数字产业在智能制造浪潮中的主导地位。',
  '2023-2024':'在2023至2024年间，制造业整体机器人密度提升13%，其中电子信息、文体工美、食品、金属、电气机械等行业增幅显著，反映出新兴与精细制造环节对自动化投入持续加速，而传统如汽车和黑色冶金等行业趋于饱和，增长趋缓。'
}

/* ------- 组件状态 ------- */
const y1=ref('2018')
const y2=ref('2019')
const chartBox=ref(null)
let chart

/* ------- 强制顺序 & 互斥 ------- */
function ensureOrder(changed){
  // 保证 y1 ≠ y2
  if(y1.value===y2.value){
    // 随便找一个不重复的年
    const alt=years.find(y=>y!==y1.value && y!==y2.value)
    if(changed==='left') y2.value=alt
    else                 y1.value=alt
  }
  // 保证 y1 < y2
  if(+y1.value>+y2.value){
    const tmp=y1.value
    y1.value=y2.value
    y2.value=tmp
  }
}

/* ------- ECharts ------- */
function buildOption(){
  const a=RAW[y1.value]; const b=RAW[y2.value]
  const inc=a.map((v,i)=>+(((b[i]-v)/v)*100).toFixed(1))
  return{
    grid:{top:80,left:80,right:60,bottom:130},
    tooltip:{trigger:'axis',axisPointer:{type:'shadow'}},
    legend:{top:40,data:[y1.value,y2.value,'增长比例']},
    xAxis:{type:'category',data:INDUSTRIES,axisLabel:{interval:0,rotate:30}},
    yAxis:[
      {type:'value',name:'机器人密度（台/万人）',splitLine:{lineStyle:{color:'#e0e0e0'}}},
      {type:'value',name:'增长比例',axisLabel:{formatter:'{value} %'},splitLine:{show:false},axisTick:{show:false},axisLine:{show:false}}
    ],
    series:[
      {name:y1.value,type:'bar',data:a,barWidth:14,itemStyle:{color:'#174EA6'},label:{show:true,position:'top'}},
      {name:y2.value,type:'bar',data:b,barWidth:14,itemStyle:{color:'#00A0F3'},label:{show:true,position:'top'}},
      {name:'增长比例',type:'line',data:inc,yAxisIndex:1,smooth:true,symbol:'circle',symbolSize:8,lineStyle:{color:'#808080'},label:{show:true,formatter:p=>`${p.value}%`}}
    ]
  }
}
function render(){ chart.setOption(buildOption(),true) }
watch([y1,y2],render)

onMounted(()=>{
  chart=echarts.init(chartBox.value)
  render()
})

/* ------- 解读文本 ------- */
const comment=computed(()=>{
  const key=`${y1.value}-${y2.value}`
  return EXPLAINS[key]||'（暂无解读，稍后补充）'
})
</script>

<style scoped>
.page{padding:12px 24px 24px;}
.intro{font-size:22px;line-height:auto;}
.note {
  font-size: 16px;
  color: #666;
  margin-top: 8px;   /* 与 Card 保持 8px 间距 */
  margin-left: 10%;
}
</style>
