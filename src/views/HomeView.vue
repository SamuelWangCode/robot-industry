<template>
  <!-- 顶部 hero 区 -->
  <div class="hero">
    <h1 class="hero-title">人工智能对就业影响监测预警系统</h1>
    <p class="hero-sub">AI × Labor Market · Monitor · Forecast · Insight</p>
  </div>

  <!-- 三列功能卡片 -->
  <Row :gutter="24" class="cards">
    <Col v-for="c in cards" :key="c.title" :xs="24" :sm="12" :md="8">
      <Card class="card" dis-hover @click="$router.push(c.path)">
        <Icon :type="c.icon" size="28" />
        <h3>{{ c.title }}</h3>
        <p>{{ c.desc }}</p>
      </Card>
    </Col>
  </Row>

  <!-- 页脚 -->
  <footer class="footer">
    © 2025 AI-Monitor Version 1.0.0
  </footer>
</template>

<script setup>
import { Icon, Card, Row, Col } from 'view-ui-plus'

const cards = [
  {
    title: '机器人密度趋势',
    desc : '按行业 / 年度查看密度变化',
    path : '/densityindustry',
    icon : 'md-stats'
  },
  {
    title: '替代效应分析',
    desc : '学历-岗位受冲击程度',
    path : '/replacement',
    icon : 'ios-swap'
  },
  {
    title: '薪酬影响分析',
    desc : '管理层 vs 员工薪酬变动',
    path : '/salary',
    icon : 'logo-yen'
  },
  {
    title: 'AI 就业监测年度报告',
    desc : '一键下载最新 PDF',
    path : '/report',
    icon : 'ios-document'
  },
  {
    title: '行业知识图谱',
    desc : '交互式关系可视化',
    path : '/knowledge',
    icon : 'md-git-branch'
  },
  {
    title: '行业大模型问答',
    desc : '与定制 GPT 对话',
    path : '/llm',
    icon : 'md-chatbubbles'
  }
]
</script>

<style scoped>
/* --- hero 区 --- */
.hero {
  width: 100%;
  padding: 60px 24px 80px;
  text-align: center;
  color: #fff;
  background: linear-gradient(135deg, #0a2e6e 0%, #007bff 50%, #00bcd4 100%);
  position: relative;
  overflow: hidden;
}
.hero-img {
  width: 240px;
  margin-bottom: 20px;
  animation: float 6s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-12px); }
}
.hero-title {
  font-size: 34px;
  margin: 0;
  font-weight: 600;
  letter-spacing: 2px;
}
.hero-sub {
  margin-top: 8px;
  font-size: 16px;
  opacity: 0.9;
}

/* --- 功能卡片 --- */
.cards {
  margin-top: -60px;          /* 与 hero 形成卡片悬浮效果 */
  padding: 0 24px 64px;
}
.card {
  cursor: pointer;
  text-align: center;
  border-radius: 8px;
  transition: all .25s;
  padding: 32px 18px 26px;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0,0,0,0.08);
}
.card h3 {
  margin: 14px 0 6px;
  font-weight: 600;
}
.card p {
  margin: 0;
  color: #666;
  font-size: 13px;
  line-height: 20px;
}

/* --- 页脚 --- */
.footer {
  text-align: center;
  font-size: 12px;
  color: #999;
  padding: 24px 0 40px;
  border-top: 1px solid #f0f0f0;
}
</style>
