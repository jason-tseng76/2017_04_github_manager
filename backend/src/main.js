import 'es6-promise/auto';
import { mapGetters, mapMutations, mapActions } from 'vuex';
import Vue from 'vue';

const router = require('./vue/lib/router.js');
const store = require('./vue/lib/store.js');

const sidemenu = require('./vue/menu.vue');
const topnav = require('./vue/topnav.vue');
const coverloading = require('./vue/coverloading.vue');

const components = {
  sidemenu,
  topnav,
  coverloading,
};

window.swal.setDefaults({
  allowOutsideClick: false,
});
moment.locale('zh-TW');

const app = new Vue({
  el: '#appwrapper',
  data: {
  },
  components,
  watch: {
    loginState(val) {
      if (!val) {
        Cookies.remove('t');
        window.location.href = '/login';
      }
    },
  },
  computed: {
    ...mapGetters(['loginState']),
  },
  methods: {
    ...mapMutations(['setCoverloading', 'token']),
    ...mapActions(['verifylogin']),
  },
  store,
  router,
  created() {
    if (Cookies.get('t') !== undefined && Cookies.get('t') !== 'undefined') {
      this.token(Cookies.get('t'));
      // this.setCoverloading(true);
      this.verifylogin(Cookies.get('t')).then(() => {
        // this.setCoverloading(false);
      });
    } else {
      window.location.href = '/login';
    }
  },
  mounted() {
    setTimeout(() => {
      window.initUtils();
    }, 100);
  },
});

window.app = app;
