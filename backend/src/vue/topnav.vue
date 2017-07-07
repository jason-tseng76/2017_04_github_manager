<template lang="pug">
// top navigation
.top_nav
  .nav_menu
    nav(role="navigation")
      .topnav_title 米蘭GitHub
      .nav.toggle
        a.menu_toggle
          i.fa.fa-bars
      ul.nav.navbar-nav.navbar-right
        li
          a.user-profile.dropdown-toggle(href="javascript:;" data-toggle="dropdown" aria-expanded="false")
            // i.fa.fa-user-o 
            img(v-bind:src="me.avatar_url")
            span 帳號 
            span.fa.fa-angle-down
          ul.dropdown-menu.pull-right
            li
              a(@click.prevent='logout')
                i.fa.fa-sign-out.pull-right 
                | Log Out

// end top navigation
</template>
<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters(['me']),
  },
  methods: {
    ...mapActions(['logout']),
  },
};
</script>
<style scoped lang='stylus'>
.user-profile > span
  margin-left 5px
.user-profile .sitename
  color #1ABB9C
.fa-sitemap
  margin-right 10px
</style>
