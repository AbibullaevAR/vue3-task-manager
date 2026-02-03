import type { Router } from 'vue-router'

export function setupNavigationGuards(router: Router): void {
  // Update document title on navigation
  router.afterEach((to) => {
    const title = to.meta.title
    document.title = title ? `${title} — Project Dashboard` : 'Project Dashboard'
  })
}
