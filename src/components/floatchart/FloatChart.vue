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
    this.draw.polyline([[10, 10], [360, 10], [360, 280], [10, 280], [10, 10]]).fill('none').stroke({ width: 1, color: 'rgba(23,152,214,0.3)' });
    // 标题
    this.draw.text("基本流程图形状").font({ size: 16 }).fill("white").move(25, 25);
    // 标题线
    this.draw.line(25, 55, 345, 55).stroke({ width: 1, color: 'rgba(23,152,214,1)' });
    // 具体模板名
    this.draw.text("流程").font({ size: 14 }).fill("white").move(60, 135);
    this.draw.text("子流程").font({ size: 14 }).fill("white").move(185, 135);
    this.draw.text("判断").font({ size: 14 }).fill("white").move(190, 245);
    this.draw.text("启动应急").font({ size: 14 }).fill("white").move(47, 245);
    this.draw.text("是或否").font({ size: 14 }).fill("white").move(280, 135);
    // 初始化模板元素
    this.initRect();
    this.initParallel();
    this.initDiamond();
    this.initCircle();
    this.initEllipse();
  }

  // 长方形
  initRect() {
    let group: any = this.nodes.group().translate(25, 90).draggable(true);
    let rect = this.draw.rect(100, 30).fill("transparent").stroke({ width: 1, color: 'rgba(102,253,251,0.65)' });
    let ellipse = this.draw.ellipse(100, 30).fill("transparent");
    group.add(ellipse); /* 明明是矩形却要包裹一个圆是因为 svg.draggable.js 只支持圆和椭圆 */
    group.add(rect);  /* 后加入 group 的会显示在上层 */
    group.on("mousedown", this.createRect);
  }

  // 平行四边形
  initParallel() {
    let group: any = this.nodes.group().translate(155, 90).draggable(true);
    let rect = this.draw.rect(100, 30).fill("transparent").stroke({ width: 1, color: 'rgba(102,253,251,0.65)' });
    rect.transform({ skewX: -15 });
    let ellipse = this.draw.ellipse(100, 30).fill("transparent");
    group.add(ellipse); /* 明明是矩形却要包裹一个圆是因为 svg.draggable.js 只支持圆和椭圆 */
    group.add(rect);  /* 后加入 group 的会显示在上层 */
    group.on("mousedown", this.createParallel);
  }

  // 菱形
  initDiamond() {
    let group: any = this.nodes.group().translate(170, 175).draggable(true);
    let rect = this.draw.rect(70, 58).fill("transparent").stroke({ width: 1, color: 'rgba(102,253,251,0.65)' });
    rect.transform({ rotation: 27 }).transform({ skewX: -35, relative: true });
    let ellipse = this.draw.ellipse(127, 65).fill("transparent");
    ellipse.transform({ x: -29, y: -3 });
    group.add(ellipse); /* 明明是矩形却要包裹一个圆是因为 svg.draggable.js 只支持圆和椭圆 */
    group.add(rect);  /* 后加入 group 的会显示在上层 */
    group.on("mousedown", this.createDiamond);
  }

  // 圆形
  initCircle() {
    let group: any = this.nodes.group().translate(40, 170).draggable(true);
    // let ellipse1 = this.draw.ellipse(65, 65).fill("transparent").stroke({ width: 1, color: 'rgba(102,253,251,0.65)' });
    let ellipse2 = this.draw.ellipse(70, 70).fill("transparent").stroke({ width: 1, color: 'rgba(102,253,251,0.65)' });
    // group.add(ellipse1);
    group.add(ellipse2);
    group.on("mousedown", this.createCircle);
  }

  // 椭圆形
  initEllipse() {
    let group: any = this.nodes.group().translate(280, 92).draggable(true);
    let ellipse = this.draw.ellipse(40, 30).fill("transparent").stroke({ dx:5, width: 1, color: 'rgba(102,253,251,0.65)' });
    group.add(ellipse);
    group.on("mousedown", this.createEllipse);
  }

  createRect(event: any) {
    this.initRect(); /* 当前的被拖走了，重新新建一个放在模板 */
    this.createElement(event, 'rect');
  }

  createParallel(event: any) {
    this.initParallel();
    this.createElement(event, 'parallel');
  }

  createDiamond(event: any) {
    this.initDiamond();
    this.createElement(event, 'diamond');
  }

  createCircle(event: any) {
    this.initCircle();
    this.createElement(event, 'circle');
  }

  createEllipse(event: any) {
    this.initEllipse();
    this.createElement(event, 'ellipse');
  }

  // 被创建新元素的初始化
  createElement(event: any, type: string) {
    let element = SVG.get(event.target.id); /* 直接通过 SVG.get(id) 获取该 svg 元素，而不是 dom 节点 */
    let groupElement = SVG.get(event.target.parentElement.id);
     /* 解绑该事件，以实现只执行一次新建的函数 */
    type === 'rect' && groupElement.off("mousedown", this.createRect);
    type === 'parallel' && groupElement.off("mousedown", this.createParallel);
    type === 'diamond' && groupElement.off("mousedown", this.createDiamond);
    type === 'circle' && groupElement.off("mousedown", this.createCircle);
    type === 'ellipse' && groupElement.off("mousedown", this.createEllipse);
    // 绑定文本
    let text = this.draw.text(function(add: any) {
      if (type === 'circle') {
        add.tspan('启动应急').fill("white");
      } else if (type === 'ellipse') {
        add.tspan('是').fill("white");
      } else {
        add.tspan('双击编辑').fill("white");
      }
    });
    if (type === 'rect' || type === 'parallel') {
      text.font({ x: 50, y: 20, family: 'Helvetica', size: 14, anchor: 'middle' });      
    }
    if (type === 'diamond') {
      text.font({ x: 36, y: 33, family: 'Helvetica', size: 14, anchor: 'middle' });     
    }
    if (type === 'circle') {
      text.font({ x: 35, y: 39, family: 'Helvetica', size: 14, anchor: 'middle' });     
    }
    if (type === 'ellipse') {
      text.font({ x: 20, y: 19, family: 'Helvetica', size: 14, anchor: 'middle' });     
    }
    text.on("dblclick", this.doubleClick); /* 这个双击事件要单独绑定，否则会被共享并按 group 里的元素个数执行多次 */
    groupElement.add(text);
    groupElement.on("contextmenu", this.startLinking);
    groupElement.on("click", this.endLinking);
  }

  // 连线
  startLinking(event: any) {
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
      console.log(SVG.get(this.sourceId));
      // 记录触发事件时鼠标的位置
      this.sourceX = event.clientX;
      this.sourceY = event.clientY;
      // 画跟踪的连接线
      this.islinking = true;
      this.draw.on("mousemove", this.tracingMouse);
    }
  }

  // 做一条跟踪线并跟随鼠标
  tracingMouse(event: any) {
    // console.log("from:", this.sourceX, this.sourceY);
    // console.log("to:  ", event.clientX, event.clientY);
    // 画出一条跟踪线
    if (this.islinking) {
      if (!this.tracingLine) {
        this.tracingLine = this.draw.line(this.sourceX - this.offsetLeft, this.sourceY - this.offsetTop, event.clientX - this.offsetLeft, event.clientY - this.offsetTop).stroke({ width: 1, color: "rgba(255,255,255,0.3)" });
        this.tracingGroup.add(this.tracingLine);
        this.draw.on("contextmenu", this.cancelLinking);
      } else {
        this.tracingLine.plot(this.sourceX - this.offsetLeft, this.sourceY - this.offsetTop, event.clientX - this.offsetLeft, event.clientY - this.offsetTop); /* 更新已创建好的直线用 plot */
      }
    }
  }

  // 结束连线
  endLinking(event: any) {
    event.preventDefault();
    if (this.islinking) { /* 结束连线 */
      // "去掉"跟踪的连接线（只是让这条线不可见）
      this.tracingLine.plot(0,0,0,0).fill("transparent"); /* 更新已创建好的直线用 plot */
      this.tracingLine = undefined;
      this.draw.off("mousemove", this.tracingMouse);
      this.draw.off("contextmenu", this.cancelLinking);  // 连接成功要移除“取消连线”的监听
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
      }, target).setLineColor("rgba(255,255,255,0.3)");
      this.islinking = false;
    }
  }

  // 取消连线
  cancelLinking(event: any) {
    event.preventDefault();
    if (this.islinking) {
      this.tracingLine.plot(0,0,0,0).fill("transparent"); /* 更新已创建好的直线用 plot */
      this.tracingLine = undefined;
      this.islinking = false;
      this.draw.off("mousemove", this.tracingMouse);
      this.draw.off("contextmenu", this.cancelLinking); // 取消连线要移除“取消连线”的监听
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
      background-color: rgb(13,76,107);
      border: 1px solid rgb(13,76,107);
      box-sizing: border-box;
    }
  }
</style>