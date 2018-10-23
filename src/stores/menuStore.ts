// 这里用到了vuex-pathify这个库帮助生成actions,getters,mutations。高级用法请查询官方文档
import { make } from 'vuex-pathify';
// 这里在声明文件声明了这个模块的一些类型声明
import * as testStoreTypes from '../types/testStoreTypes';

const state: testStoreTypes.State = {
  menu: ['asdasdsa'],
};

// 生成getters跟State的变量名一样，比如上文中state的menu的getter就是menu
const getters = make.getters(state);
// 生成的actions自动在state的变量名加上set前缀，比如上文的menu就是setMenu
const actions = make.actions(state);
// 这个根据pathify的配置有关系，具体查询官方文档
const mutations = make.mutations(state);

export default {
  state,
  mutations,
  getters,
  actions,
  namespaced: true,
};
