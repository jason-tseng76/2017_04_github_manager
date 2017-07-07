<template lang="pug">
  div
    //
      transition(name="fade")
    div(v-if="coverloadingState")
      .coverloading.flex-cc
        i.fa.fa-circle-o-notch.fa-spin
</template>

<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {};
  },
  computed: {
    ...mapState(['coverloadingState']),
  },
};
</script>
<style scoped lang="stylus">
.coverloading
  position: fixed
  top 0
  left 0
  width 100%
  height 100%
  font-size 28px
  background-color rgba(255,255,255,.7)
  z-index 9999
</style>
