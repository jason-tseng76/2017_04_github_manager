<template lang="pug">
.row
  .col-md-12
    .x_panel
      .x_title
        h3 Repo列表
        p
          small 非Admin只能看到【自己是協作者】的Repository，然後，因為GitHub api的關係，如果你這個帳號下有其它【非米蘭但你也是協作者】的repository也會被列出來XD...無視就好。
        .clearfix
      .x_content
        .row
          .col-sm-6
            .form-inline
              span  一次顯示 
              select.form-control.input-sm(v-model='pagesize' @change="fetchData")
                option(value="10") 10
                option(value="20") 20
                option(value="30") 30
                option(value="40") 40
                option(value="50") 50
              span  筆資料 
          .col-sm-6
            form.form-inline.pull-right
              // .form-group.top_search
              //   .input-group
              //     input.form-control(type="text" v-model='q')
              //     span.input-group-btn
              //       button.btn.btn-default(@click.prevent='fetchData')
              //         i.fa.fa-search
              // button.btn.btn-default.btn-sm(type="button" @click="fetchData") 搜尋
        // button.btn.btn-danger.btn-xs(type="button" tag="button" @click="delSelected") 刪除選取的
        // router-link.btn.btn-info.btn-xs(to="/repo/add" tag="button") 新增一筆
        table.table.table-hover.table-striped
          thead
            tr
              th.hidden-sm.hidden-xs(style="width:30px")
                // label.checkbox-inline
                //   input(type="checkbox" v-model="allcheck")
                |#
              th Name
              th.hidden-sm.hidden-xs URL
              th.hidden-sm.hidden-xs 更新日期
              th(style="width:100px")
                router-link.btn.btn-info.btn-xs.btn-block(to="/repo/add" tag="button") 新增
          tbody
            tr(v-for='(item, index) in listdata' v-bind:key='index+"_"+Math.floor(Math.random()*10000)')
              td.hidden-sm.hidden-xs
                | {{(index+1)+pagesize*(page-1)}}
              td {{item.name}}
              td.hidden-sm.hidden-xs 
                a(v-bind:href='item.html_url' target='_blank')
                  | 開啟連結
                  i.fa.fa-external-link
              td.hidden-sm.hidden-xs {{dateformat(item.updated_at)}}
              td 
                .btn-group.btn-group-justified
                  .btn-group
                    button.btn.btn-success.btn-xs(type="button" @click="modItem(item.name)") 修改
                  .btn-group
                    button.btn.btn-warning.btn-xs(type="button" @click="delItem(item.name)") 刪除
        .row
          .col-xs-12.center
            ul.pagination
              li(v-bind:class="page<=1 ? 'disabled': ''")
                template(v-if="page>1")
                  a(href='' @click.prevent='prevPage') Previous
                template(v-else)
                  a Previous
              template(v-for='(item, index) in pagenations')
                li(v-bind:class="page===item ? 'active': ''" v-bind:key="item+'_'+Math.floor(Math.random()*100000)")
                  a(href='' @click.prevent='gotoPage(item)' v-bind:key="item+'_'+Math.floor(Math.random()*100000)") {{item}}
              li(v-bind:class="page>=totalpage ? 'disabled': ''")
                template(v-if="page<totalpage")
                  a(href='' @click.prevent='nextPage') Next
                template(v-else)
                  a Next
</template>
<script>
import { mapMutations, mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {
      pagesize: 10,
      page: 1,
      q: '',
      listdata: [],
      totalcount: 0,
      totalpage: 1,
      pagenations: [],
      schecked: [],
      allcheck: '',
    };
  },
  computed: {
    // ...mapState(['user']),
    ...mapGetters(['selectedAppId']),
  },
  watch: {
    allcheck(val) {
      if (val) {
        this.schecked = [];
        for (let i = 0; i < this.listdata.length; i++) {
          this.schecked.push(this.listdata[i]._id);
        }
      } else {
        this.schecked = [];
      }
    },
  },
  methods: {
    ...mapMutations(['setCoverloading']),
    ...mapActions(['loadRepoList', 'delRepo']),
    fetchData() {
      this.setCoverloading(true);
      this.loadRepoList({
        pagesize: this.pagesize,
        page: this.page,
        // q: this.q,
      }).then((d) => {
        this.allcheck = false;
        this.schecked = [];
        if (d.status === 'OK') {
          this.listdata = d.data;
          this.page = d.page;
          this.pagesize = d.pagesize;
          this.totalpage = d.totalpage;
          this.calPagenation();
        } else {
          this.listdata = [];
          swal('Oops', d.err.message, 'error');
        }
        this.setCoverloading(false);
      });
    },
    gitname(n) {
      return n.split('/')[n.split('/').length - 1];
    },
    calPagenation() {
      this.pagenations = [];
      let s = this.page - 4;
      if (s < 1) s = 1;
      for (let i = s; i <= s + 9 && i <= this.totalpage; i++) {
        this.pagenations.push(i);
      }
    },
    modItem(id) {
      this.$router.push(`/repo/${id}`);
    },
    delItem() {
      swal({
        title: '未開放',
        text: '保險起見，暫時不開放刪除Repo的功能，如果要刪除，請跟有權限直接進入GitHub的總監講喔。',
        type: 'warning',
        confirmButtonText: '瞭改',
      });
    },
    gotoPage(p) {
      if (p === this.page) return;
      this.page = p;
      this.$router.push(`/repos?page=${this.page}&pagesize=${this.pagesize}&q=${this.q}`);
      // this.fetchData();
    },
    prevPage() {
      this.page -= 1;
      this.$router.push(`/repos?page=${this.page}&pagesize=${this.pagesize}&q=${this.q}`);
    },
    nextPage() {
      this.page += 1;
      this.$router.push(`/repos?page=${this.page}&pagesize=${this.pagesize}&q=${this.q}`);
    },
    dateformat(d) {
      return moment(d).format('DD-MM-YYYY HH:mm:ss');
    },
    getQuery(route) {
      const r = route || this.$route;
      this.page = r.query.page || 1;
      this.pagesize = r.query.pagesize || 10;
      this.q = r.query.q || '';
    },
  },
  created() {
    this.getQuery();
    this.fetchData();
  },
  beforeRouteUpdate(to, from, next) {
    this.getQuery(to);
    this.fetchData();
    next();
  },
};
</script>

<style scoped lang="stylus">
.tile_count
  margin-bottom 0
.input-group
  margin-bottom 0
.form-inline > button
  margin-bottom 0
.center
  text-align center
</style>

