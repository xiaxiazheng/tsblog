import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);
import { baseEnv } from './config';

let routerConfig: any = {
  routes: [
    {
      path: '/',
      component: () => import('@/views/Home.vue'),
      children: [
        {
          path: '',
          name: 'HomeMain',
          component: () => import('@/views/main/HomeMain.vue'),
        },
        {
          path: 'tree',
          name: 'Tree',
          component: () => import('@/views/tree/Tree.vue'),
        },
        {
          path: 'photowall',
          name: 'PhotoWall',
          component: () => import('@/views/photowall/PhotoWall.vue'),
        },
        {
          path: 'log',
          name: 'Log',
          component: () => import('@/views/log/Log.vue'),
        },
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/admin',
      component: () => import('@/views/Admin.vue'),
      children: [
        {
          path: '',
          name: 'AdminHomeMain',
          component: () => import('@/views/main/AdminHomeMain.vue'),
        },
        {
          path: 'admintree',
          name: 'AdminTree',
          component: () => import('@/views/tree/AdminTree.vue'),
        },
        {
          path: 'adminphotowall',
          name: 'AdminPhotoWall',
          component: () => import('@/views/photowall/AdminPhotoWall.vue'),
        },
        {
          path: 'adminlog',
          name: 'AdminLog',
          component: () => import('@/views/log/AdminLog.vue'),
        }
      ]
    }
  ],
};

// 若是服务器端，开启 history 模式
if (baseEnv === "production") {
  routerConfig.mode = 'history';
}

export default new VueRouter(routerConfig);
