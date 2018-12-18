<template>
  <div class="floatchart">
    <div id="drawing"></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Getter, Action } from 'vuex-class';
import SVG from 'svg.js';
import 'svg.draggable.js/dist/svg.draggable.js';

@Component({
  components: {
  }
})
export default class FloatChart extends Vue {
  draw: any;

  mounted() {
    this.$nextTick(function () {
      this.init();
    });
  }

  init() {
    this.draw = SVG('drawing').size("100%", "100%");
    this.initRect();
    this.initCircle();
    this.initText();
  }

  initRect() {
    let rect: any = this.draw.rect(40, 40).attr({ fill: '#f06' });
    rect.draggable(true);
    rect.on("mousedown", this.createRect);
  }

  initCircle() {
    let circle: any = this.draw.circle(40).attr({ fill: '#f06' }).move(0, 50);
    circle.draggable(true);
    circle.on("mousedown", this.createCircle);
  }

  initText() {
    let text: any = this.draw.text((add: any) => {
      add.tspan('文本模板').fill('#fff').newLine();
      // add.tspan('点我编辑').fill('#fff')
    }).move(0, 100);
    text.draggable(true);
    text.on("mousedown", this.createText);
  }

  createRect(event: any) {
    this.initRect(); /* 当前的被拖走了，重新新建一个放在模板 */
    let element = SVG.get(event.target.id); /* 直接通过 SVG.get(id) 获取该 svg 元素，而不是 dom 节点 */
    element.off("mousedown", this.createRect); /* 解绑该事件，以实现只执行一次这个函数 */
    element.width(70); /* 改变一下原来的样式 */
    element.height(70); /* 直接用属性作为方法即可使用 */
    element.on("dblclick", this.doubleClick); /* 绑定新的事件 */
  }

  createCircle(event: any) {
    this.initCircle();
    let element = SVG.get(event.target.id);
    element.off("mousedown", this.createCircle);
    element.radius(70);
    element.on("dblclick", this.doubleClick);
  }

  createText(event: any) {
    console.log(11);
    this.initText();
    let element = SVG.get(event.target.id);
    element.off("mousedown", this.createText); /* 这里并没有 off 到，该事件依然在起作用 */
    element.on("dblclick", this.doubleClick);
  }

  doubleClick() {
    console.log("双击");
  }
}
</script>

<style lang="less">
  .floatchart {
    position: relative;
    height: calc(100% - 2px);
    #drawing {
      width: 100%;
      height: 100%;
      background-color: #ccc;
      border: 1px solid #ccc;
      box-sizing: border-box;
    }
  }
</style>