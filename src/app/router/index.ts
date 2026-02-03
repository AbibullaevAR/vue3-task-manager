import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './routes'
import { setupNavigationGuards } from './guards'

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

setupNavigationGuards(router)

export default router
