import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import Box from './pages/Box.vue'
import Home from './pages/Home.vue'
import './style.css'

const routes = [
  { path: '/', component: Home },
  { path: '/box', component: Box },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes, // `routes: routes` 的缩写
})

const app = createApp(App)

app.use(ElementPlus)
app.use(router)

app.mount('#app')
