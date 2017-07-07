/*
global app
*/
import Vue from 'vue';
import VueRouter from 'vue-router';
// import store from './store';

Vue.use(VueRouter);
const routes = [
  // {
  //   path: '/', redirect: '/applications',
  // },
  {
    path: '/repos',
    component: (resolve) => { require(['../repolist.vue'], resolve); },
    name: 'repolist',
  },
  {
    path: '/repo/:type',
    component: (resolve) => { require(['../repo_add.vue'], resolve); },
    name: 'repo_add',
  },
  {
    path: '/users',
    component: (resolve) => { require(['../users.vue'], resolve); },
    name: 'users',
  },
  {
    path: '/user/:type',
    component: (resolve) => { require(['../user_add.vue'], resolve); },
    name: 'user_add',
  },
];
const router = new VueRouter({
  routes,
  mode: 'history',
  linkActiveClass: 'current-page', // 'router-active',
  base: '/',
});

router.beforeEach((to, from, next) => {
  window.closeMenu();
  // store.dispatch('verifylogin', Cookies.get('t')).then((d) => {
  //   if (d.token === '') {
  //     return next(false);
  //   }
  //   if ((d.exp * 1000) - Date.now() <= 60 * 10 * 1000) {
  //     store.dispatch('updatetoken', Cookies.get('t')).then((d2) => {
  //       if (d2.token === '') {
  //         return next(false);
  //       }
  //       return Cookies.set('t', d2.token);
  //     });
  //   }
  //   return next();
  // });
  next();
});

module.exports = router;
