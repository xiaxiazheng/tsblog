import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);

export default new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: () => import('@/views/Home.vue'),
      children: [
        {
          path: '',
          name: 'HomeMain',
          component: () => import('@/views/main/Main.vue'),
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
        {
          path: 'chart',
          name: 'Chart',
          component: () => import('@/views/chart/chart.vue'),
        }
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
          name: 'AdminMain',
          component: () => import('@/views/main/AdminMain.vue'),
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
        },
        {
          path: 'adminchart',
          name: 'AdminChart',
          component: () => import('@/views/chart/chart.vue'),
        }
      ]
    }
  ],
});
