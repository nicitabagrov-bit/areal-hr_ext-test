import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'

axios.defaults.baseURL = 'https://unhallowed-spooky-haunting-jr9v757pvxq4h54p9-3000.app.github.dev'
axios.defaults.withCredentials = true

createApp(App).mount('#app')
