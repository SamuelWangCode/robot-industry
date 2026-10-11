import { createRouter, createWebHashHistory } from 'vue-router'
const HomeView = () => import('../views/HomeView.vue')
const DensityIndustry = () => import('../views/DensityIndustry.vue')
const DensityYear = () => import('../views/DensityYear.vue')
const DensityIndustryYear = () => import('../views/DensityIndustryYear.vue')
const Replacement = () => import('../views/Replacement.vue')
const Salary = () => import('../views/Salary.vue')
const AIIndustry = () => import('../views/AIIndustry.vue')
const AIEmployment = () => import('../views/AIEmployment.vue')
const Knowledgement = () => import('../views/Knowledgement.vue')
const LLM = () => import('../views/LLM.vue')

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
      path: '/density-industry',
      name: 'densityindustry',
      component: DensityIndustry,
    },
    {
      path: '/density-year',
      name: 'densityyear',
      component: DensityYear,
    },
    {
      path: '/density-industry-year',
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
      path: '/AI-industry',
      name: 'AIindustry',
      component: AIIndustry,
    },
    {
      path: '/AI-employment',
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
