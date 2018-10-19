import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import hljs from 'highlight.js';

// 使页面pre代码高亮
let hlfunc = function (el: any) {
  let blocks = el.querySelectorAll('pre');
  blocks.forEach((block: any) => {
    hljs.highlightBlock(block); // 这个用 cdn 引入了
  });
};
Vue.directive('highlight', hlfunc);

import {
  Message,
  MessageBox
} from 'element-ui';
Vue['prototype']['$message'] = Message;   // this["$message"]
Vue['prototype']['$confirm'] = MessageBox.confirm; // this["$confirm"]

Vue.config.productionTip = false;

import './static/global.less';

new Vue({
  router,
  store,
  el: '#app',
  template: '<App/>',
  components: { App }
});