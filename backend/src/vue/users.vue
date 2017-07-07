<template lang="pug">
  div
    .page-title
      .title_left
        h3
          |使用者列表
          small  所有的使用者就對了
    .clearfix
    .row
      .col-md-12
        .x_panel
          .x_title
            h2 使用者列表
            ul.nav.navbar-right.panel_toolbox
              li
                a.collapse-link
                  i.fa.fa-chevron-up
            .clearfix
          .x_content
            table.table.table-hover.table-striped
              thead
                tr
                  th(style="width:50px") #
                  th.hidden-sm.hidden-xs Email
                  th GitHub名稱
                  th 權限
                  th.hidden-sm.hidden-xs 狀態
                  th.hidden-sm.hidden-xs 上次登入
                  th(style="width:100px")
                    router-link.btn.btn-info.btn-xs.btn-block(type="button" tag="button" to="/user/add") 新增
              tbody
                tr(v-for="(item, index) in userlist" v-bind:key="item._id")
                  td
                    .gitprofilepic
                      img(v-bind:src="item.avatar_url")
                  td.hidden-sm.hidden-xs {{item.email}}
                  td
                    | {{item.login}}
                  td
                    span.label(v-bind:class="item.role==='admin'?'label-warning':'label-success'") {{item.role}}
                  td.hidden-sm.hidden-xs {{userState(item.active)}}
                  td.hidden-sm.hidden-xs {{dateformat(item.loginDate)}}
                  td
                    .btn-group.btn-group-justified
                      .btn-group
                        button.btn.btn-success.btn-xs(type="button" @click="modUser(item._id)") 修改
                      .btn-group
                        button.btn.btn-warning.btn-xs(type="button" @click="delUser(item._id)") 刪除
</template>
<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';

export default {
  computed: {
    ...mapGetters(['userlist']),
  },
  methods: {
    ...mapActions(['getuserlist', 'deluser']),
    ...mapMutations(['setCoverloading']),
    modUser(id) {
      this.$router.push(`/user/${id}`);
    },
    delUser(id) {
      swal({
        title: '確定?',
        text: '刪錯了不要哭喔',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: '不要囉嗦',
        cancelButtonText: '對不起我錯了',
      }).then(() => {
        this.setCoverloading(true);
        this.deluser(id).then((d) => {
          if (d.status !== 'OK') {
            swal('Oops', d.err.message, 'error');
          }
          this.setCoverloading(false);
        });
      }, () => {});
    },
    dateformat(d) {
      return moment(d).format('DD-MM-YYYY HH:mm:ss');
    },
    userState(d) {
      if (d === 0) return '停止中';
      return '正常';
    },
  },
  created() {
    setTimeout(() => {
      window.initUtils();
      this.setCoverloading(true);
      this.getuserlist().then(() => {
        this.setCoverloading(false);
      });
    }, 30);
  },
};
</script>
<style scoped lang="stylus">
th .btn
  margin-bottom 0
.gitprofilepic
  width 40px
  border-radius 5px
  overflow hidden
.gitprofilepic > img
  width 100%
.table>tbody>tr>td
  vertical-align middle
</style>
