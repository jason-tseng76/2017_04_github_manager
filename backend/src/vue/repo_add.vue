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
                  | Repo名稱
                  span.required *
                .col-sm-7.col-xs-12
                  input#auto.form-control.col-md-7.col-xs-12(type="text" v-model.trim="reponame" @keyup.enter="onSubmit")
                  small
                    |為了方便識別專案，請盡量依照「年_月_客戶_專案名稱」的方式來命名。
                    br
                    |所有人都有權限開啟GitHub，並加入協作者，但只有Admin才有權限移除協作者。
              .form-group(v-if="$route.params.type === 'add'")
                label.control-label.col-sm-3.col-xs-12
                  | 是否要自動init
                .col-sm-7.col-xs-12
                  .checkbox
                    label
                      input(type="checkbox" value="true" v-model="autoinit")
                      | 自動Init
                    p
                      small
                        | 如果選擇自動Init，第一次請用clone。
              .form-group
                label.control-label.col-sm-3.col-xs-12
                  | 協作者
                .col-sm-7.col-xs-12
                  .checkbox.collaboratorsbox(v-for="item in collaboratorsDisplay" v-bind:key="item.login")
                    label
                      .collaborators
                        .collaboratorscheck
                          input(type="checkbox" v-bind:value="item.login" v-model="colSelected")
                        .gitprofilepic
                          img(v-bind:src="item.avatar_url")
                        .collaboratorsInfo
                          .collaboratorsLogin {{item.login}}
                          .collaboratorsEmail
                            small {{item.email}}
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
      reponame: '',
      collaborators: [],
      collaboratorsDisplay: [],
      colSelected: [],
      autoinit: false,
    };
  },
  watch: {
    colSelected(val) {
      for (let i = 0; i < this.collaborators.length; i++) {
        let found = false;
        val.forEach((ele) => {
          if (ele === this.collaborators[i].login) found = true;
        });
        if (!found && this.me.role !== 'admin') {
          this.colSelected.push(this.collaborators[i].login);
          return swal('Oops...', '你沒有權限移除原有的協作者喔', 'error');
        }
      }
      return '';
    },
  },
  computed: {
    ...mapGetters(['me', 'userlist']),
    title() {
      if (this.$route.params.type === 'add') {
        return '新增Repository';
      }
      return 'Repository資料';
    },
    subtitle() {
      return '';
    },
  },
  methods: {
    ...mapMutations(['setCoverloading']),
    ...mapActions(['addRepo', 'updateRepo', 'getuserlist', 'loadRepo', 'loadCollaborators']),
    onCancel() {
      this.$router.push('/repos');
    },
    onSubmit() {
      const data = {};
      let method = 'updateRepo';
      if (this.$route.params.type === 'add') {
        method = 'addRepo';
        data.init = 'no';
        if (this.autoinit) data.init = 'yes';
      } else {
        data.oname = this.$route.params.type;
      }
      if (this.reponame === '') {
        return swal('Oops..', '請填寫Repository的名稱', 'error');
      }
      data.name = this.reponame;
      data.cols = this.colSelected.join();
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
          this.$router.push('/repos');
        } else {
          swal('Oops', d.err.message, 'error');
        }
      });
    },
    dealCollaboratorsList() {
      this.userlist.forEach((ele) => {
        this.collaboratorsDisplay.push({
          login: ele.login,
          avatar_url: ele.avatar_url,
          email: ele.email,
          check: false,
        });
      });
      this.collaborators.forEach((ele) => {
        let inlist = false;
        for (let i = 0; i < this.collaboratorsDisplay.length; i++) {
          const item = this.collaboratorsDisplay[i];
          if (item.login === ele.login) {
            inlist = true;
            item.check = true;
            this.colSelected.push(ele.login);
            break;
          }
        }
        if (!inlist) {
          this.collaboratorsDisplay.push({
            login: ele.login,
            avatar_url: ele.avatar_url,
            check: true,
          });
          this.colSelected.push(ele.login);
        }
      });
      this.setCoverloading(false);
    },
    fetchData(type) {
      const mtype = type || this.$route.params.type;
      if (mtype === 'add') return this.dealCollaboratorsList();
      this.reponame = mtype;
      return this.loadCollaborators(this.reponame).then((d) => {
        if (d.status === 'OK') {
          d.data.forEach((ele) => {
            if (ele.login !== 'MedialandDev') {
              this.collaborators.push({
                login: ele.login,
                avatar_url: ele.avatar_url,
              });
            }
          });
          this.dealCollaboratorsList();
        }
      });
    },
  },
  beforeRouteUpdate(to, from, next) {
    this.reponame = '';
    this.collaborators = [];
    this.collaboratorsDisplay = [];
    this.colSelected = [];
    this.autoinit = false;
    next();
    this.setCoverloading(true);
    this.fetchData(to.params.type);
  },
  created() {
    setTimeout(() => {
      this.setCoverloading(true);
      if (this.userlist.length === 0) {
        this.getuserlist().then(() => {
          this.fetchData();
        });
      } else {
        this.fetchData();
      }
      // $('#colltags').tagsInput({
      //   defaultText: '',
      //   width: '100%',
      //   height: 'auto',
      // });
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
.collaboratorsbox
  width 50%
  float left
  padding-top 0
.collaboratorsbox>label
  width 100%;
.collaborators
  display table-cell
  padding 8px
  line-height 1.42857143
  vertical-align middle
  width 100%;
  float left
  cursor pointer
.collaboratorsbox:hover
  background-color #e0f2f1
.collaborators>div
  float left;
.collaborators input
  margin-top 14px
.gitprofilepic
  width 40px
  border-radius 5px
  overflow hidden
.gitprofilepic > img
  width 100%
.collaboratorsInfo
  margin-left 10px
.collaboratorsLogin
  font-weight 700
</style>
