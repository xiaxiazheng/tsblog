<template>
  <div class="floatchart" ref="chart">
    <div id="drawing"></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Getter, Action } from 'vuex-class';
import SVG from 'svg.js';
import 'svg.draggable.js/dist/svg.draggable.js';
// import 'svg.connectable.js/dist/svg.connectable.js';
import 'svg.connectable.js/lib/index.js';

@Component
export default class FloatChart extends Vue {
  draw: any;    // SVG 实例
  nodes: any;   // 所有节点
  links: any;   // 所有线
  markers: any; // 这个未知
  islinking: boolean = false;
  sourceId: any;
  sourceX: any;
  sourceY: any;
  tracingGroup: any;
  tracingLine: any;
  offsetTop: any;
  offsetLeft: any;

  mounted() {
    this.$nextTick(function () {
      this.init();
    });
  }

  init() {
    /* 获取位置偏移 */
    let dom: any = this.$refs.chart;
    this.offsetTop = dom.offsetTop;
    this.offsetLeft = dom.offsetLeft;
    /* 生成 svg */
    this.draw = SVG('drawing').size("100%", "100%");
    this.links = this.draw.group();
    this.markers = this.draw.group();
    this.nodes = this.draw.group();
    this.tracingGroup = this.draw.group();
    /* 初始化模板 */
    this.initTemplate();
  }

  // 初始化模板
  initTemplate() {
    // 模板边框
    this.draw.polyline([[0, 0], [350, 0], [350, 250], [0, 250]]).fill('none').stroke({
      width: 1,
      color: 'red'
    });
    // 标题
    this.draw.text("基本流程图形状").font({
      size: 16,
    }).fill("white").move(15, 15);
    // 标题线
    this.draw.line(15, 45, 335, 45).stroke({ width: 1 }).fill("white");
    // 初始化模板元素
    this.initRect();
    this.initCircle();
  }

  initRect() {
    let group: any = this.nodes.group().translate(15, 60).draggable(true);
    let rect = this.draw.rect(70, 70).fill("#f06");
    let circle = this.draw.circle(70).fill("blue");
    group.add(circle); /* 明明是矩形却要包裹一个圆是因为 svg.draggable.js 只支持圆和椭圆 */
    group.add(rect);  /* 后加入 group 的会显示在上层 */
    group.on("mousedown", this.createRect);
  }

  initCircle() {
    let group: any = this.nodes.group().translate(100, 60).draggable(true);
    let circle = this.draw.circle(70).fill("#f06");
    group.add(circle);
    group.on("mousedown", this.createCircle);
  }

  // initText() {
  //   let text: any = this.draw.text((add: any) => {
  //     add.tspan('文本模板').fill('#fff').newLine();
  //     // add.tspan('点我编辑').fill('#fff')
  //   }).move(0, 100);
  //   text.draggable(true);
  //   text.on("mousedown", this.createText);
  // }

  createRect(event: any) {
    this.initRect(); /* 当前的被拖走了，重新新建一个放在模板 */
    let element = SVG.get(event.target.id); /* 直接通过 SVG.get(id) 获取该 svg 元素，而不是 dom 节点 */
    element.off("mousedown", this.createRect); /* 解绑该事件，以实现只执行一次这个函数 */
    let groupElement = SVG.get(event.target.parentElement.id);
    groupElement.on("contextmenu", this.startLink);
    groupElement.on("click", this.endLink);
    groupElement.on("dblclick", this.doubleClick); /* 绑定新的事件 */
  }

  createCircle(event: any) {
    this.initCircle();
    let element = SVG.get(event.target.id);
    element.off("mousedown", this.createCircle);
    let groupElement = SVG.get(event.target.parentElement.id);
    groupElement.on("contextmenu", this.startLink);
    groupElement.on("click", this.endLink);
    groupElement.on("dblclick", this.doubleClick); /* 绑定新的事件 */
  }

  // createText(event: any) {
  //   this.initText();
  //   let element = SVG.get(event.target.id);
  //   element.off("mousedown", this.createText); /* 这里并没有 off 到，该事件依然在起作用 */
  //   element.on("dblclick", this.doubleClick);
  // }

  // 开始连线
  startLink(event: any) {
    event.preventDefault();
    this.sourceId = event.target.parentElement.id; /* 保存所属 group 的 id */
    this.islinking = true;
    this.sourceX = event.clientX;  // 触发事件时鼠标的位置
    this.sourceY = event.clientY;
    this.draw.on("mousemove", this.tracingMouse);
  }

  // 做一条线并跟随鼠标
  tracingMouse(event: any) {
    // console.log("from:", this.sourceX, this.sourceY);
    // console.log("to:  ", event.clientX, event.clientY);
    // 画出一条跟踪线
    if (this.islinking) {
      if (!this.tracingLine) {
        this.tracingLine = this.draw.line(this.sourceX - this.offsetLeft, this.sourceY - this.offsetTop, event.clientX - this.offsetLeft, event.clientY - this.offsetTop).stroke({ width: 1 }).fill("#000");
        this.tracingGroup.add(this.tracingLine);
      } else {
        this.tracingLine.plot(this.sourceX - this.offsetLeft, this.sourceY - this.offsetTop, event.clientX - this.offsetLeft, event.clientY - this.offsetTop); /* 更新已创建好的直线用 plot */
      }
    }
  }

  // 确认连线
  endLink(event: any) {
    if (this.islinking) {
      this.tracingLine.plot(0,0,0,0).fill("transparent"); /* 更新已创建好的直线用 plot */
      this.tracingLine = undefined;
      // this.tracingGroup.remove(this.tracingLine);
      if (event.target.parentElement.id === this.sourceId) {  // 如果两次都点击了同一个，就取消本次连线
        this.islinking = false;
        return;
      }
      let source = SVG.get(this.sourceId);
      let target = SVG.get(event.target.parentElement.id);
      let link = source.connectable({
        container: this.links,
        markers: this.markers,
        padEllipse: true  /* 连接线带箭头 */
      }, target).setLineColor("#5D4037");
      this.islinking = false;
    }
  }

  // 双击，编辑文本
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