import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    {
			path: '',
			component: () => import('@/views/Home.vue'),
			children: [
				{
					path: '',
					name: 'Main',
					component: () => import('@/views/home/Main.vue'),
				},
				{
					path: 'tree',
					name: 'Tree',
					component: () => import('@/views/home/Tree.vue'),
				},
				{
					path: 'photowall',
					name: 'PhotoWall',
					component: () => import('@/views/home/PhotoWall.vue'),
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
					component: () => import('@/views/admin/AdminMain.vue'),
				},
				{
					path: 'admintree',
					name: 'AdminTree',
					component: () => import('@/views/admin/AdminTree.vue'),
				},
				{
					path: 'adminphotowall',
					name: 'AdminPhotoWall',
					component: () => import('@/views/admin/AdminPhotoWall.vue'),
				}
			]
		},
  ],
});
