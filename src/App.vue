<script setup>
import Sidebar from './components/SideBar.vue'
</script>

<template>
  <Layout style="min-height: 100vh; display: flex; flex-direction: column;">
    <!-- 顶部栏 -->
    <Header style="background:#001529; color:#fff; font-size:20px; padding-left:24px;">
      人工智能对就业影响监测预警系统
    </Header>

    <!-- 主体区域：一个横向 flex -->
    <div style="flex:1; display:flex;">
      <!-- 左侧导航 -->
      <Sider width="240" style="background:#fff; border-right:1px solid #eee;">
        <Sidebar />
      </Sider>

      <!-- 右侧内容 -->
      <div
        style="
          flex:1 1 0;            /* 关键：让它占满剩余空间 */
          min-width:0;           /* 关键：允许在 flex 布局里收放 */
          background:#f5f7f9;
          padding:24px;
          display:flex;
          flex-direction:column;
        "
      >
        <div
          style="
            background:#fff;
            padding:32px;
            border-radius:8px;
            box-shadow:0 2px 8px rgba(0,0,0,0.05);
            flex:1;
          "
        >
          <router-view />
        </div>
      </div>
    </div>
  </Layout>
</template>

<style scoped>
* {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
