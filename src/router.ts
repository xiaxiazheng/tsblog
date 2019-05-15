import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);

// const scrollBehavior = function (to: any, from: any, savedPosition: any) {
//   if (to.hash) {
//     return {
//       // 通过 to.hash 的值來找到对应的元素
//       selector: to.hash
//     };
//   }
// };

export default new VueRouter({
  // scrollBehavior,
  mode: 'history',
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
});
