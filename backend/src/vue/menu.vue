<template lang="pug">
.col-md-3.left_col
  .left_col.scroll-view
    .navbar.nav_title(style="border: 0;")
      a.site_title
        i.fa.fa-github
        span
          | 米蘭GitHub
    .nav.toggle
      a.menu_toggle
        i.fa.fa-bars
    .clearfix
    hr
    #sidebar-menu.main_menu_side.hidden-print.main_menu
      .menu_section
        h3 GitHub
        ul.nav.side-menu
          li
            a(url="/repo")
              i.fa.fa-code-fork
              | Repositories
              span.fa.fa-chevron-down
            ul.nav.child_menu
              router-link(to="/repos" tag="li")
                a Repo列表
              router-link(to="/repo/add" tag="li")
                a 新增Repo
      hr
      .menu_section
        h3 Account
        ul.nav.side-menu
          li
            a
              i.fa.fa-user-circle-o
              | 帳號管理 
              span.fa.fa-chevron-down
            ul.nav.child_menu
              router-link(to="/users" tag="li")
                a 帳號列表 
              router-link(to="/user/add" tag="li")
                a 新增帳號 
          li
            a(@click.prevent='logout')
              i.fa.fa-sign-out
              | Log Out
</template>
<script>
import { mapActions } from 'vuex';

export default {
  methods: {
    ...mapActions(['logout']),
  },
};
</script>
<style scoped lang='stylus'>
.site_title span
  margin-left 10px
#sidebar-menu
  margin-top 10px
.left_col hr
  margin-top 0
  border-top 1px solid #405469
  width 90%
.menu_section
  margin-bottom 0
</style>
