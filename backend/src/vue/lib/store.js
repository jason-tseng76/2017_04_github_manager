import Vue from 'vue';
import Vuex from 'vuex';
import * as userModule from './storeUserModule';
import * as loginModule from './storeLoginModule';
import * as repoModule from './storeRepoModule';
// import * as receiptModule from './storeReceiptModule';
// import * as drawModule from './storeDrawModule';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    coverloadingState: false,
    token: '',
  },
  getters: {
    token(state) {
      return state.token;
    },
  },
  mutations: {
    token(state, t) {
      state.token = t;
    },
    setCoverloading(state, val) {
      state.coverloadingState = val;
    },
  },
  modules: {
    login: loginModule,
    users: userModule,
    repo: repoModule,
    // receipt: receiptModule,
    // draw: drawModule,
  },
});

module.exports = store;
