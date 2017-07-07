import * as config from '../../config/config';

const userModule = {
  state: {
    ulist: [],
  },
  getters: {
    userlist(state) {
      return state.ulist;
    },
  },
  mutations: {
  },
  actions: {
    getuserlist({ state, rootState }) {
      return new Promise((resolve) => {
        let rs = { status: 'ERROR' };
        if (!rootState.token) return resolve();
        return $.ajax({
          url: `${config.AjaxUrl}/api/users`,
          method: 'GET',
          datatype: 'json',
          headers: {
            Authorization: `Bearer ${rootState.token}`,
          },
        }).done((d) => {
          if (d.status === 'OK') {
            state.ulist = d.data;
          } else {
            state.ulist = [];
          }
          rs = d;
        }).always(() => {
          resolve(rs);
        });
      });
    },
    adduser({ rootState }, param) {
      return new Promise((resolve) => {
        if (!rootState.token) return resolve();
        let rs = { status: 'ERROR' };
        return $.ajax({
          url: `${config.AjaxUrl}/api/user`,
          method: 'POST',
          datatype: 'json',
          data: param,
          headers: {
            Authorization: `Bearer ${rootState.token}`,
          },
        }).done((d) => {
          rs = d;
        }).always(() => {
          resolve(rs);
        });
      });
    },
    updateuser({ rootState }, param) {
      return new Promise((resolve) => {
        if (!rootState.token) return resolve();
        let rs = { status: 'ERROR' };
        return $.ajax({
          url: `${config.AjaxUrl}/api/user/${param.id}`,
          method: 'PUT',
          datatype: 'json',
          data: param,
          headers: {
            Authorization: `Bearer ${rootState.token}`,
          },
        }).done((d) => {
          rs = d;
        }).always(() => {
          resolve(rs);
        });
      });
    },
    deluser({ rootState, state }, param) {
      return new Promise((resolve) => {
        if (!rootState.token) return resolve();
        let rs = { status: 'ERROR' };
        return $.ajax({
          url: `${config.AjaxUrl}/api/user/${param}`,
          method: 'DELETE',
          datatype: 'json',
          headers: {
            Authorization: `Bearer ${rootState.token}`,
          },
        }).done((d) => {
          rs = d;
          if (d.status === 'OK') {
            state.ulist.find((ele, index, ar) => {
              if (ele._id === param) {
                ar.splice(index, 1);
                return true;
              }
              return false;
            });
          }
        }).always(() => {
          resolve(rs);
        });
      });
    },
    getuserinfo({ rootState }, param) {
      return new Promise((resolve) => {
        if (!rootState.user.token) return resolve();
        let rs = { status: 'ERROR' };
        return $.ajax({
          url: `${config.AjaxUrl}/api/user/${param}`,
          method: 'GET',
          datatype: 'json',
          headers: {
            Authorization: `Bearer ${rootState.token}`,
          },
        }).done((d) => {
          rs = d;
        }).always(() => {
          resolve(rs);
        });
      });
    },
  },
};

module.exports = userModule;
