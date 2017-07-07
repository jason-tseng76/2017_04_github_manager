import * as config from '../../config/config';

const storemodule = {
  state: {
    lState: true,
    myinfo: {},
  },
  getters: {
    loginState(state) {
      return state.lState;
    },
    me(state) {
      return state.myinfo;
    },
  },
  mutations: {
    me(state, param) {
      state.myinfo = param;
    },
  },
  actions: {
    verifylogin({ state, rootState }, param) {
      let data = { _id: '', email: '', login: '', role: '' };
      return new Promise((resolve) => {
        $.ajax({
          url: `${config.AjaxUrl}/api/verifylogin`,
          method: 'GET',
          datatype: 'json',
          headers: {
            Authorization: `Bearer ${param}`,
          },
        }).done((d) => {
          if (d.status === 'OK') {
            data = {
              _id: d.data._id,
              email: d.data.email,
              login: d.data.login,
              avatar_url: d.data.avatar_url,
              role: d.data.role,
              exp: d.data.exp,
            };
            rootState.token = param;
          }
        }).always(() => {
          state.myinfo = data;
          if (data._id !== '') {
            state.lState = true;
          } else {
            state.lState = false;
          }
          resolve(data);
        });
      });
    },
    // updatetoken({ state, rootState }, param) {
    //   let data = { token: '' };
    //   return new Promise((resolve) => {
    //     $.ajax({
    //       url: `${config.AjaxUrl}/api/updatetoken`,
    //       method: 'GET',
    //       datatype: 'json',
    //       headers: {
    //         Authorization: `Bearer ${param}`,
    //       },
    //     }).done((d) => {
    //       if (d.status === 'OK') {
    //         data = {
    //           token: d.data.token,
    //         };
    //       }
    //     }).always(() => {
    //       rootState.user.token = data.token;
    //       if (data.token === '') {
    //         state.lState = false;
    //       }
    //       resolve(data);
    //     });
    //   });
    // },
    logout({ state, rootState }) {
      $.ajax({
        url: `${config.AjaxUrl}/api/logout`,
        method: 'GET',
        datatype: 'json',
        headers: {
          Authorization: `Bearer ${rootState.token}`,
        },
      }).always(() => {
        state.lState = false;
      });
    },
  },
};

module.exports = storemodule;
