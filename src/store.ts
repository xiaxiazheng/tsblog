import Vue from 'vue';
import Vuex from 'vuex';
// 这里用到了vuex-pathify这个库帮助生成actions,getters,mutations
import pathify from 'vuex-pathify';
import menuStore from './stores/menuStore';
import mapStore from './stores/mapStore';

Vue.use(Vuex);

export default new Vuex.Store({
  plugins: [pathify.plugin],
  modules: {
    menuStore,
    mapStore
  },
});

/* 自带的
// import Vue from 'vue';
// import Vuex from 'vuex';
// Vue.use(Vuex);
// export default new Vuex.Store({
//   state: {
//   },
//   mutations: {
//   },
//   actions: {
//   },
// });
*/