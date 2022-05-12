import { num } from "./add.js";
import { createApp, h } from "vue";
import App from './App.vue';
import './index.css'

console.log('main', num);

createApp(App).mount('#app')