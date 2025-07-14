<template>
  <Menu :theme="theme" :active-name="$route.name" @on-select="handleSelect" width="220px">
    <MenuItem name="home">
      <Icon type="ios-home" /> 首页
    </MenuItem>
    <MenuGroup title="工业机器人密度">
      <MenuItem name="densityindustry">
        <Icon type="ios-stats" /> 按行业
      </MenuItem>
      <MenuItem name="densityyear">
        <Icon type="ios-podium" /> 按年份
      </MenuItem>
      <MenuItem name="densityindustryyear">
        <Icon type="ios-git-compare" /> 行业×年份分析
      </MenuItem>
    </MenuGroup>
    <MenuGroup title="影响分析">
      <MenuItem name="replacement">
        <Icon type="ios-swap" /> 对就业的替代效应
      </MenuItem>
      <MenuItem name="salary">
        <Icon type="logo-yen" /> 对薪酬的影响
      </MenuItem>
      <MenuItem name="AIindustry">
        <Icon type="ios-briefcase" /> AI相关行业就业情况
      </MenuItem>
      <MenuItem name="AIemployment">
        <Icon type="ios-warning" /> AI对就业影响监测预警年度报告
      </MenuItem>
    </MenuGroup>
    <MenuGroup title="智能系统">
      <MenuItem name="knowledgement">
        <Icon type="ios-book" /> 行业知识图谱
      </MenuItem>
      <MenuItem name="LLM">
        <Icon type="ios-chatbubbles" /> 行业大模型问答
      </MenuItem>
    </MenuGroup>
  </Menu>
</template>

<script>
export default {
  data() {
    return {
      theme: 'light'
    };
  },
  methods: {
    handleSelect(name) {
      this.$router.push({ name });
    }
  }
}
</script>
