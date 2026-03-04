import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './app/router'

async function main() {
  if (import.meta.env.PROD) {
    const { worker } = await import('./shared/api/msw/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
}

main()
