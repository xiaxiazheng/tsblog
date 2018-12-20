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
import 'svg.connectable.js/dist/svg.connectable.js';

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

  createRect(event: any) {
    this.initRect(); /* 当前的被拖走了，重新新建一个放在模板 */
    this.createElement(event, 'rect');
  }

  createCircle(event: any) {
    this.initCircle();
    this.createElement(event, 'circle');
  }

  // 被创建新元素的初始化
  createElement(event: any, type: string) {
    let element = SVG.get(event.target.id); /* 直接通过 SVG.get(id) 获取该 svg 元素，而不是 dom 节点 */
    let groupElement = SVG.get(event.target.parentElement.id);
     /* 解绑该事件，以实现只执行一次新建的函数 */
    type === 'rect' && groupElement.off("mousedown", this.createRect);
    type === 'circle' && groupElement.off("mousedown", this.createCircle);
    // 绑定文本
    let text = this.draw.text(function(add: any) {
      add.tspan('双击编辑')
    });
    text.font({
      x: 35,
      y: 39,
      family: 'Helvetica',
      size: 14,
      anchor: 'middle'
    });
    text.on("dblclick", this.doubleClick); /* 这个双击事件要单独绑定，否则会被共享并按 group 里的元素个数执行多次 */
    groupElement.add(text);
    groupElement.on("contextmenu", this.goLinking);
  }

  // 连线
  goLinking(event: any) {
    event.preventDefault();
    /* 开始连线 */
    if (!this.islinking) {
      // 找出被操作的 group，并把它的id 存到 this.sourceId
      let parentElement = SVG.get(event.target.parentElement.id);
      if (parentElement.type === 'text') {
        this.sourceId = event.target.parentElement.parentElement.id;
      } else {
        this.sourceId = event.target.parentElement.id;
      }
      // 记录触发事件时鼠标的位置
      this.sourceX = event.clientX;
      this.sourceY = event.clientY;
      // 画跟踪的连接线
      this.islinking = true;
      this.draw.on("mousemove", this.tracingMouse);
    } else { /* 结束连线 */
      // "去掉"跟踪的连接线（只是让这条线不可见）
      this.tracingLine.plot(0,0,0,0).fill("transparent"); /* 更新已创建好的直线用 plot */
      this.tracingLine = undefined;
      this.draw.off("mousemove", this.tracingMouse);
      // 定位 group 的 id（因为 tspan 离 group 中间隔了一层 text，要找出来）
      let parentElement = SVG.get(event.target.parentElement.id);
      let parentId;
      if (parentElement.type === 'text') {
        parentId = event.target.parentElement.parentElement.id;
      } else {
        parentId = event.target.parentElement.id;
      }
      // 如果两次都点击了同一个 group，就取消本次连线（比较的是 group 的 id）
      if (parentId === this.sourceId) {
        this.islinking = false;
        return;
      }
      // 连线
      let source: any = SVG.get(this.sourceId);
      let target = SVG.get(parentId);
      let link = source.connectable({
        container: this.links,
        markers: this.markers,
        padEllipse: true  /* 连接线带箭头 */
      }, target).setLineColor("#5D4037");
      this.islinking = false;
    }
  }

  // 做一条跟踪线并跟随鼠标
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

  // 双击，编辑文本
  doubleClick(event: any) {
    let tspan = SVG.get(event.target.id);
    console.log(tspan);
    let input = prompt("请输入节点名称：", ""); // 弹出窗口请求输入
    tspan.clear();
    tspan.text(input);
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