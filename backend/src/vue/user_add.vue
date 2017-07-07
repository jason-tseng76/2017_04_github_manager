<template lang="pug">
  div
    .row
      .col-md-12
        .x_panel
          .x_title
            h3 {{title}}
            .clearfix
          .x_content
            form.form-horizontal.form-label-left
              .form-group
                label.control-label.col-sm-3.col-xs-12
                  | Username
                .col-sm-6.col-xs-12
                  input.form-control.col-md-7.col-xs-12(type="text" v-model.trim="login" @keyup.enter="onSubmit")
                  small
                    |使用者在GitHub上顯示的名稱(不確定可先不填)，因為加入協作者是以此為依據，若不確定請勿修改
              .form-group
                label.control-label.col-sm-3.col-xs-12
                  | Email
                  span.required *
                .col-sm-6.col-xs-12
                  input.form-control.col-md-7.col-xs-12(type="text" v-model.trim="email" @keyup.enter="onSubmit")
                  small
                    |使用者Email，需要是米蘭的Email
              .form-group
                label.control-label.col-sm-3.col-xs-12
                  | 權限
                  span.required *
                .col-sm-6.col-xs-12
                  label.radio-inline
                    input(type="radio" value="admin" name="role" v-model.trim="role" v-bind:disabled="me.role!=='admin'?true:false")
                    | 管理者
                  label.radio-inline
                    input(type="radio" value="user" name="role" checked v-model.trim="role" v-bind:disabled="me.role!=='admin'?true:false")
                    | 一般使用者
                  div
                    small
                      |【管理者】擁有最高權限，【一般使用者】只能增加Repository與設定協作者
              .form-group
                label.control-label.col-sm-3.col-xs-12
                  | 帳號狀態
                  span.required *
                .col-sm-6.col-xs-12
                  label.radio-inline
                    input(type="radio" value="1" name="act" checked v-model.trim="active" v-bind:disabled="me.role!=='admin'?true:false")
                    | 正常
                  label.radio-inline
                    input(type="radio" value="0" name="act" v-model.trim="active" v-bind:disabled="me.role!=='admin'?true:false")
                    | 停用
                  div
                    small
                      |如果有帳號使用者暫時不會使用時，可以選擇停用
              .ln_solid
              .col-xs-12.flex-cc
                button.btn.btn-default(type="button" @click="onCancel") 取消
                button.btn.btn-success(type="button" @click="onSubmit") 送出
</template>
<script>
import { mapMutations, mapActions, mapGetters } from 'vuex';

export default {
  data() {
    return {
      login: '',
      email: '',
      role: 'user',
      active: 1,
    };
  },
  watch: {
  },
  computed: {
    ...mapGetters(['me', 'userlist']),
    title() {
      if (this.$route.params.type === 'add') {
        return '新增使用者';
      }
      return '使用者資料';
    },
    subtitle() {
      return '';
    },
  },
  methods: {
    ...mapMutations(['setCoverloading']),
    ...mapActions(['adduser', 'updateuser', 'logout']),
    onCancel() {
      this.$router.push('/users');
    },
    onSubmit() {
      const data = {};
      let method = 'updateuser';
      if (this.$route.params.type === 'add') {
        method = 'adduser';
      } else {
        data.id = this.$route.params.type;
      }
      // if (this.uname.length < 5 || this.uname.length > 50) {
      //   return swal('Oops...', '使用者帳號需為5-50個英文與數字的組合', 'error');
      // }
      data.login = this.login;
      data.email = this.email;
      data.role = this.role;
      data.active = this.active;
      swal({
        title: '',
        text: '送出中',
        type: 'info',
        allowOutsideClick: false,
        showConfirmButton: false,
      });
      return this[method](data).then((d) => {
        swal.close();
        if (d.status === 'OK') {
          this.$router.push('/users');
        } else {
          swal('Oops', d.err.message, 'error');
        }
      });
    },
  },
  created() {
    setTimeout(() => {
      if (this.$route.params.type !== 'add') {
        const id = this.$route.params.type;
        for (let i = 0; i < this.userlist.length; i++) {
          if (this.userlist[i]._id === id) {
            this.login = this.userlist[i].login;
            this.email = this.userlist[i].email;
            this.role = this.userlist[i].role;
            this.active = this.userlist[i].active;
          }
        }
        if (this.email === '') {
          swal('Oops', '沒有這筆資料喔', 'error');
          this.$router.replace('/users');
        }
      }
      $(this.$el).find('input').eq(0).focus();
    }, 30);
  },
  beforeDestroy() {
  },
};
</script>
<style scoped lang="stylus">
.form-group small
  color #9e9e9e;
.x_title h3
  margin: 5px 0 6px
  float: left
  display: block
  text-overflow: ellipsis
  overflow: hidden
  white-space: nowrap
button, .input-group
  margin-bottom 0
.cppwd
  cursor pointer
</style>
