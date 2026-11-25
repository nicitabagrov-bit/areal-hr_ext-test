import { createApp } from 'vue'
import { Quasar, Notify } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import App from './App.vue'
import axios from 'axios'

axios.defaults.baseURL = 'https://unhallowed-spooky-haunting-jr9v757pvxq4h54p9-3000.app.github.dev'
axios.defaults.withCredentials = true

const app = createApp(App)

app.use(Quasar, {
  plugins: { Notify },
})

app.mount('#app')
