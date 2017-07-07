import * as config from '../../config/config';

const storemodule = {
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
    loadRepoList({ state, rootState }, data) {
      return new Promise((resolve) => {
        let rs = { status: 'ERROR', err: { message: 'unknown' } };
        $.ajax({
          url: `${config.AjaxUrl}/api/repos`,
          method: 'GET',
          datatype: 'json',
          data: {
            pagesize: data.pagesize,
            page: data.page,
            q: data.q,
          },
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
    loadRepo({ state, rootState }, data) {
      return new Promise((resolve) => {
        let rs = { status: 'ERROR', err: { message: 'unknown' } };
        $.ajax({
          url: `${config.AjaxUrl}/api/repos/${data}`,
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
    loadCollaborators({ state, rootState }, data) {
      return new Promise((resolve) => {
        let rs = { status: 'ERROR', err: { message: 'unknown' } };
        $.ajax({
          url: `${config.AjaxUrl}/api/repos/${data}/collaborators`,
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
    addRepo({ state, dispatch, rootState }, data) {
      return new Promise((resolve) => {
        let rs = { status: 'ERROR', err: { message: 'unknown' } };
        $.ajax({
          url: `${config.AjaxUrl}/api/repos`,
          method: 'POST',
          datatype: 'json',
          data,
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
    updateRepo({ state, dispatch, rootState }, data) {
      return new Promise((resolve) => {
        let rs = { status: 'ERROR', err: { message: 'unknown' } };
        $.ajax({
          url: `${config.AjaxUrl}/api/repos/${data.oname}`,
          method: 'PUT',
          datatype: 'json',
          data,
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
    delRepo({ state, rootState }, data) {
      return new Promise((resolve) => {
        let rs = { status: 'ERROR', err: { message: 'unknown' } };
        $.ajax({
          url: `${config.AjaxUrl}/api/repos/${data.name}`,
          method: 'DELETE',
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

module.exports = storemodule;
