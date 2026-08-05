import { createApp } from 'vue';

import App from './App.vue';

// TODO 后续需要设置默认主题不然会出现有些样式不加载
document.documentElement.dataset.asTheme = 'light';

createApp(App).mount('#app');
