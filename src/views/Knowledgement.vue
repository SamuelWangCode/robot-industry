<template>
  <div class="page">
    <div class="tool">
      <Button size="small" icon="ios-home" @click="reset">回到最顶层</Button>
    </div>
    <div ref="box" class="chart"></div>
  </div>
</template>

<script setup>
/* ------------ 基础引入 ------------ */
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import { TreeChart }        from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer }   from 'echarts/renderers'
echarts.use([TreeChart, TooltipComponent, CanvasRenderer])

/* ------------ 元数据 ------------ */
/* src/views/Knowledgement.vue 顶部 —— 替换整个 RAW 常量 */
const RAW = {
  name: '人工智能',
  collapsed: true,
  children: [
    // ================================================= 1. 软件 / 算法型
    {
      name: '软件 / 算法型智能系统', collapsed: true,
      children: [
        // ---------- 1‑1 生成式 AI
        {
          name: '生成式 AI (AIGC)', 
          examples:'ChatGPT、Midjourney、文心一言、Sora' ,
          collapsed: true,
          children: [
            {   // 教育
              name: '教育', collapsed: true,
              children: [
                { name: '教师',    effect:'中弱替代（辅助教学内容生成为主，难以完全替代人际互动）' },
                { name: '教研辅助', effect:'中强替代（可自动生成教案、课件等标准化内容）' }
              ]
            },
            {   // 传媒
              name: '传媒', collapsed: true,
              children: [
                { name: '编辑', effect:'中强替代（新闻、内容摘要初稿可由AI生成）' },
                { name: '策划', effect:'中弱替代（创意类岗位AI可提供灵感，但人类判断更关键）' }
              ]
            },
            {   // 广告
              name: '广告', collapsed: true,
              children: [
                { name: '文案',     effect:'强替代（短文案、推广语等AI生成效果好，已大规模应用）' },
                { name: '美术设计', effect:'中强替代（AI图像生成可初步取代部分视觉设计工作）' }
              ]
            },
            {   // 影视
              name: '影视', collapsed: true,
              children: [
                { name: '分镜', effect:'中弱替代（AI可生成初稿，但难以把握导演意图）' },
                { name: '配音', effect:'中强替代（AI合成语音质量已高，可用于部分配音工作）' }
              ]
            }
          ]
        },

        // ---------- 1‑2 RPA + AI
        {
          name: '智能流程自动化 (RPA + AI)', 
          examples:'审批机器人、发票识别、财务自动对账' ,
          collapsed: true,
          children: [
            {
              name:'金融', collapsed:true,
              children:[
                { name:'会计',       effect:'中强替代（可自动进行票据审核、对账流程，提高效率）' },
                { name:'审核岗',     effect:'中强替代（规则明确、重复性高的审核工作易被替代）' }
              ]
            },
            {
              name:'制造', collapsed:true,
              children:[
                { name:'采购岗', effect:'中强替代（标准化采购审批流程可由机器人完成）' },
                { name:'报销岗', effect:'中强替代（流程化票据处理任务易被自动化系统替代）' }
              ]
            },
            {
              name:'医疗', collapsed:true,
              children:[
                { name:'医保结算岗', effect:'中强替代（医保项目对接和核对标准明确，适合自动化）' }
              ]
            },
            {
              name:'政府', collapsed:true,
              children:[
                { name:'档案管理岗', effect:'中弱替代（文档数字化可自动完成，但仍需人工监督）' }
              ]
            }
          ]
        },

        // ---------- 1‑3 虚拟助手
        {
          name: '虚拟助手', 
          examples:'Siri、智能客服、企业知识助理' ,
          collapsed: true,
          children: [
            {
              name:'通信', collapsed:true,
              children:[ { name:'客户服务岗', effect:'强替代（标准化问题答复效率高，可显著降低人工客服需求）' } ]
            },
            {
              name:'政务', collapsed:true,
              children:[ { name:'咨询解答岗', effect:'中强替代（常见咨询问题可由智能助手处理，复杂事务仍需人工）' } ]
            },
            {
              name:'车载系统', collapsed:true,
              children:[ { name:'导航助手', effect:'中强替代（语音控制与导航功能成熟，可替代部分交互）' } ]
            },
            {
              name:'IT 企业', collapsed:true,
              children:[ { name:'员工问答机器人', effect:'中强替代（内部知识库答疑效率高，但复杂问题仍需人工干预）' } ]
            }
          ]
        },

        // ---------- 1‑4 预测 / 分析 AI
        {
          name: '预测 / 分析 AI', 
          examples:'风控模型、销售预测、疾病预测系统',
          collapsed: true,
          children: [
            { name:'金融', collapsed:true,
              children:[ { name:'风控岗', effect:'中强替代（可辅助识别潜在风险，提高决策准确性，但最终把关仍需人判断）' } ] },
            { name:'零售', collapsed:true,
              children:[ { name:'市场预测岗', effect:'中强替代（在数据充分的条件下，模型预测优于人工直觉）' } ] },
            { name:'医疗', collapsed:true,
              children:[ { name:'临床分析岗', effect:'中弱替代（可提供参考建议，但临床判断须由医生做出）' } ] },
            { name:'物流', collapsed:true,
              children:[ { name:'调度预测岗', effect:'中强替代（预测能力可优化路径与效率，减少人为误差）' } ] }
          ]
        },

        // ---------- 1‑5 推荐系统
        {
          name: '推荐系统', 
          examples:'淘宝推荐、视频推送、广告匹配',
          collapsed: true,
          children: [
            { name:'电商',  collapsed:true,
              children:[ { name:'商品策划岗',   effect:'中强替代（推荐系统能精准分析用户偏好，辅助决策）' } ] },
            { name:'媒体',  collapsed:true,
              children:[ { name:'内容运营',   effect:'中强替代（内容推荐系统可大幅提升用户粘性和效率）' } ] },
            { name:'广告',  collapsed:true,
              children:[ { name:'投放优化',   effect:'强替代（广告系统高度自动化，智能匹配能力已成熟）' } ] },
            { name:'教育',  collapsed:true,
              children:[ { name:'个性化学习推荐', effect:'中弱替代（可辅助个性化学习，但教育内容仍需人工设计）' } ] }
          ]
        }
      ]
    },

    // ================================================= 2. 智能机器人
    {
      name: '智能机器人', 
      collapsed: true,
      children: [
        // ---------- 2‑1 工业机器人
        {
          name: '工业机器人', 
          examples:'焊接、搬运、组装臂' ,
          collapsed: true,
          children: [
            { name:'汽车制造', collapsed:true,
              children:[ { name:'焊装工位、冲压搬运', effect:'强替代（自动化水平高，已广泛应用于重复性劳动场景）' } ] },
            { name:'电子制造', collapsed:true,
              children:[ { name:'贴片与组装', effect:'强替代（大规模流水线可被机器人完全替代）' } ] },
            { name:'金属加工', collapsed:true,
              children:[ { name:'打磨、激光切割', effect:'强替代（机器人具备稳定性与高精度优势）' } ] },
            { name:'家电制造', collapsed:true,
              children:[ { name:'部件装配',   effect:'中强替代（适用于标准化装配，但复杂操作仍需人工）' } ] },
            { name:'机械制造', collapsed:true,
              children:[ { name:'流水线自动化', effect:'强替代（机器人可承担高频重复性操作）' } ] }
          ]
        },

        // ---------- 2‑2 服务机器人
        {
          name: '服务机器人', 
          examples:'餐饮配送机器人、迎宾机器人、陪护机器人、智能导购机器人、景区讲解机器人' ,
          collapsed: true,
          children: [
            { name:'餐饮', collapsed:true,
              children:[ { name:'智能送餐员',   effect:'中强替代（可在封闭场景中自动完成配送任务，减少人工服务压力）' } ] },
            { name:'酒店', collapsed:true,
              children:[ { name:'前台迎宾',   effect:'中弱替代（可提供基本问候与指引，难以满足复杂人际互动需求）' } ] },
            { name:'养老', collapsed:true,
              children:[ { name:'陪护巡房',   effect:'中弱替代（适合基础巡视与提醒，情感交互与突发处理仍依赖人类）' } ] },
            { name:'零售', collapsed:true,
              children:[ { name:'导购',  effect:'中弱替代（适用于解答常见问题，体验引导需人工补充）' } ] },
            { name:'旅游', collapsed:true,
              children:[ { name:'景区讲解与引导', effect:'中强替代（具备语音识别和路径规划能力，适合标准化讲解任务）' } ] }
          ]
        },

        // ---------- 2‑3 医疗机器人
        {
          name: '医疗机器人', 
          examples:'手术辅助机器人、康复训练机器人、移动辅助机器人、远程手术协作机器人' ,
          collapsed: true,
          children: [
            { name:'医院', collapsed:true,
              children:[ { name:'微创手术助手', effect:'中强替代（在高精度控制下可辅助完成手术操作，提升效率与稳定性）' } ] },
            { name:'康复中心', collapsed:true,
              children:[ { name:'康复训练辅助', effect:'中弱替代（适合重复性训练任务，需人工评估与引导配合）'} ] },
            { name:'老年护理机构', collapsed:true,
              children:[ { name:'日常移动辅助', effect:'中弱替代（能辅助简单移动，但无法全面替代护理人员）' } ] },
            { name:'远程医疗', collapsed:true,
              children:[ { name:'远程手术协作与诊断', effect:'中强替代（可远程精准操控，扩大医疗服务覆盖范围）' } ] }
          ]
        },

        // ---------- 2‑4 仓储物流机器人
        {
          name: '仓储物流机器人', 
          examples:'AGV、AMR搬运系统' ,
          collapsed: true,
          children: [
            { name:'电商仓储',    collapsed:true,
              children:[ { name:'自动搬运与分拣', effect:'强替代（效率高、错误率低，可大幅减少人工搬运和分拣工人）' } ] },
            { name:'快递物流',  collapsed:true,
              children:[ { name:'智能入库出库', effect:'中强替代（替代传统叉车、输送线作业）' } ] },
            { name:'制造业仓储',  collapsed:true,
              children:[ { name:'线边配送',   effect:'中强替代（缩短物料流转时间，降低人工成本）' } ] },
            { name:'零售物流中心',  collapsed:true,
              children:[ { name:'拣选与装箱', effect:'中强替代（适合标准化流程，仍需人工处理异常情况）' } ] }
          ]
        },

        // ---------- 2‑5 特种机器人
        {
          name: '特种机器人', 
          examples:'无人机、无人车',
          collapsed: true,
          children: [
            { name:'农业',   collapsed:true,
              children:[ { name:'植保、田间巡检', effect:'中强替代（适合标准化场景，提升覆盖效率）' } ] },
            { name:'安防巡检',   collapsed:true,
              children:[ { name:'园区 / 边界巡逻',   effect:'中强替代（全天候无盲区巡逻，降低人力成本）' } ] },
            { name:'交通运输',   collapsed:true,
              children:[ { name:'自动驾驶配送', effect:'中强替代（在特定园区或闭环环境中应用成熟）' } ] },
            { name:'矿业',   collapsed:true,
              children:[ { name:'矿井探测、运矿车', effect:'强替代（危险环境中替代人工作业）' } ] },
            { name:'物流配送',   collapsed:true,
              children:[ { name:'末端无人车、应急送药', effect:'中弱替代（在低密度区域逐步推广，仍需人工配合）' } ] }
          ]
        }
      ]
    }
  ]
}


/* ------------ 工具函数 ------------ */
const clone = o => structuredClone(o)
const collapse = n => { n.collapsed = true; n.children?.forEach(collapse) }
function applyStyle (node){
  if (!node.children?.length && node.effect){
    node.itemStyle = {
      color:
        node.effect.startsWith('强')   ? '#e84c3d' :   // 强 → 红
        node.effect.startsWith('中强') ? '#f39c12' :   // 中强 → 橙
                                         '#3498db'     // 中弱 → 蓝
    }
  }
  node.children?.forEach(applyStyle)
}
/* 只展开 root→clicked 路径，其余全部折叠 */
function buildTree(clicked) {
  const root = clone(RAW)
  applyStyle(root)
  if (!clicked) return root
  const dfs = node => {
    if (node.name === clicked) { node.collapsed = false; return true }
    for (const c of node.children || []) {
      if (dfs(c)) {
        node.collapsed = false
        node.children.forEach(sib => sib !== c && collapse(sib))
        return true
      }
    }
  }
  dfs(root)
  return root
}

/* ------------ ECharts 实例 ------------ */
const box   = ref(null)
let   chart = null
let   currentNode = null       // 记录当前展开的节点

function draw (tree) {
  if (!chart) return
  chart.setOption({
    tooltip:{
    trigger:'item',
    formatter:p=>{
      const d = p.data
      if (d.effect)   return `<b>${d.name}</b><br/>替代效应：${d.effect}`
      if (d.examples) return `<b>${d.name}</b><br/>示例：${d.examples}`
      return d.name
    }
  },
    series: [{
      type : 'tree',
      data : [tree],
      orient: 'TB',              // ⬅️ 垂直方向
      top  : 40,
      left : 20,
      right: 20,
      bottom: 20,
      symbol: 'circle',
      symbolSize: 14,
      roam  : true,
      label : {
        position: 'top',
        verticalAlign: 'middle',
        align : 'center',
        fontSize: 14
      },
      lineStyle: { color:'#858585' },
      animationDuration: 300
    }]
  }, true)
}


/* ------------ 尝试安全初始化 ------------ */
function safeInit () {
  if (chart) return            // 已有实例
  const dom = box.value
  if (!dom) return
  if (!dom.clientWidth || !dom.clientHeight) {
    requestAnimationFrame(safeInit)     // 下一帧再测
    return
  }
  chart = echarts.init(dom)
  chart.on('click', onClick)
  draw(buildTree(null))
}

function onClick({ data }) {
  if (!data.children?.length) return       // 叶子节点，无需展开
  // 折叠同级
  data.parent?.children?.forEach(sib => sib !== data && collapse(sib))
  // 切换自身
  data.collapsed = !data.collapsed
  // 重绘
  draw(buildTree(data.collapsed ? data.parent?.name ?? null : data.name))
}

/* ------------ 生命周期 ------------ */
onMounted(() => {
  nextTick(safeInit)
})
onBeforeUnmount(() => {
  chart?.off('click', onClick)
  chart?.dispose()
  chart = null
})

/* ------------ 顶层按钮 ------------ */
function reset () {
  currentNode = null
  collapse(RAW)                // 折叠所有
  draw(buildTree(null))
}
</script>

<style scoped>
.page  { padding:12px 24px 24px; position:relative; }
.chart { width:100%; max-height:820px; overflow:hidden; }
.tool  { position:absolute; right:28px; top:12px; z-index:9; }
.chart { width: 100%; height: 600px; overflow: hidden; }
</style>
