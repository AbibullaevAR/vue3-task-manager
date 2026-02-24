import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/pages/dashboard/DashboardPage.vue'),
    meta: { title: 'Dashboard' },
  },
  {
    path: '/kanban',
    name: 'kanban',
    component: () => import('@/pages/kanban/KanbanPage.vue'),
    meta: { title: 'Kanban Board' },
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/pages/projects/ProjectsPage.vue'),
    meta: { title: 'Projects' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]
