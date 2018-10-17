import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

// 使页面pre代码高亮
Vue.directive('highlight', function (el) {
  let blocks = el.querySelectorAll('pre');
  blocks.forEach((block)=>{
    hljs.highlightBlock(block) // 这个用 cdn 引入了
  })
})

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
