<template>
  <div class="adminlogcont">
    <vue-editor v-model="content"></vue-editor>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { VueEditor } from "vue2-editor";

@Component({
  components: {
    VueEditor
  },
})
export default class AdminLogCont extends Vue {
  content: string = '<h1>Some initial content</h1>';

  @Watch("content")
  handleContentChange() {
    console.log(this.content);
    console.log(this.content.length);
  }
}
</script>

<style lang="less">
  .adminlogcont {
    height: 100%;
  }
</style>
