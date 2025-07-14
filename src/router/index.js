import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DensityIndustry from '../views/DensityIndustry.vue'
import DensityYear from '../views/DensityYear.vue'
import DensityIndustryYear from '../views/DensityIndustryYear.vue'
import Replacement from '../views/Replacement.vue'
import Salary from '../views/Salary.vue'
import AIIndustry from '../views/AIIndustry.vue'
import AIEmployment from '../views/AIEmployment.vue'
import Knowledgement from '../views/Knowledgement.vue'
import LLM from '../views/LLM.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      alias: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/densityindustry',
      name: 'densityindustry',
      component: DensityIndustry,
    },
    {
      path: '/densityyear',
      name: 'densityyear',
      component: DensityYear,
    },
    {
      path: '/densityindustryyear',
      name: 'densityindustryyear',
      component: DensityIndustryYear,
    },
    {
      path: '/replacement',
      name: 'replacement',
      component: Replacement,
    },
    {
      path: '/salary',
      name: 'salary',
      component: Salary,
    },
    {
      path: '/AIindustry',
      name: 'AIindustry',
      component: AIIndustry,
    },
    {
      path: '/AIemployment',
      name: 'AIemployment',
      component: AIEmployment,
    },
    {
      path: '/knowledgement',
      name: 'knowledgement',
      component: Knowledgement,
    },
    {
      path: '/LLM',
      name: 'LLM',
      component: LLM,
    }
  ],
})

export default router
