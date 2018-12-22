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

@Component
export default class FloatChart extends Vue {
  draw: any;          // SVG 实例
  nodes: any;         // 所有节点
  links: {            // 所有线
    sourceId: any;
    targetId: any;
    lineId: any;
  }[] = [];
  islinking: boolean = false;  // 是否正在连接
  sourceId: any;      // 开始连接后源对象的 id
  sourceX: any;
  sourceY: any;
  tracingLine: any;   // 连线时用的追踪线
  offsetTop: any;     // 整个 svg 盒子顶部偏移量
  offsetLeft: any;    // 整个 svg 盒子左边偏移量
  linkButton: any;    // 工具栏的编辑按钮
  editImg: any = require('@/static/img/edit.jpg');
  removeButton: any;  // 工具栏的删除按钮
  removeImg: any = require('@/static/img/edit.jpg');

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
    this.nodes = this.draw.group();
    /* 初始化模板 */
    this.initTemplate();
  }

  // 初始化左上角模板
  initTemplate() {
    // 模板边框
    this.draw.polyline([[10, 10], [360, 10], [360, 280], [10, 280], [10, 10]]).fill('none').stroke({ width: 1, color: 'rgba(23,152,214,0.3)' });
    // 标题
    this.draw.text("基本流程图形状").font({ size: 16 }).fill("white").move(25, 25);
    // 使用提示
    this.draw.text((add: any) => {
      add.tspan('右键点开工具栏，左边是连线右边是删除节点。').newLine();
      add.tspan('开始连线后，在空白处点击右键可取消本次连线，').newLine();
      add.tspan('左键选中其他元素可建立连线。').newLine();
      add.tspan('双击文本可编辑，编辑输入为空则删除该节点。').newLine();
    }).font({ size: 12 }).fill("white").move(15, 300);
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
    group.add(rect);  /* 后加入 group 的会显示在上层 */
    group.on("mouseup", (event: any) => {
      /* 虽然这里是 group 监听事件 */
      if (event.clientX < (360 + this.offsetLeft) && event.clientY < (280 + this.offsetTop)) {
        let ele = SVG.get(event.target.parentElement.id);
        ele.remove();  /* 不合要求，销毁 */
      } else {
        this.createElement(event, 'rect');  /* 对被拖走的元素进行初始化 */
      }
      // 不管拖走的合不合要求，这里都要新建一个
      this.initRect();
    });
  }

  // 平行四边形
  initParallel() {
    let group: any = this.nodes.group().translate(155, 90).draggable(true);
    let rect = this.draw.rect(100, 30).fill("transparent").stroke({ width: 1, color: 'rgba(102,253,251,0.65)' });
    rect.transform({ skewX: -15 });
    group.add(rect);  /* 后加入 group 的会显示在上层 */
    group.on("mouseup", (event: any) => {
      /* 虽然这里是 group 监听事件 */
      if (event.clientX < (360 + this.offsetLeft) && event.clientY < (280 + this.offsetTop)) {
        let ele = SVG.get(event.target.parentElement.id);
        ele.remove();  /* 不合要求，销毁 */
      } else {
        this.createElement(event, 'parallel');  /* 对被拖走的元素进行初始化 */
      }
      // 不管拖走的合不合要求，这里都要新建一个
      this.initParallel();
    });
  }

  // 菱形
  initDiamond() {
    let group: any = this.nodes.group().translate(170, 175).draggable(true);
    let rect = this.draw.rect(70, 58).fill("transparent").stroke({ width: 1, color: 'rgba(102,253,251,0.65)' });
    rect.transform({ rotation: 27 }).transform({ skewX: -35, relative: true });
    group.add(rect);  /* 后加入 group 的会显示在上层 */
    group.on("mouseup", (event: any) => {
      /* 虽然这里是 group 监听事件 */
      if (event.clientX < (360 + this.offsetLeft) && event.clientY < (280 + this.offsetTop)) {
        let ele = SVG.get(event.target.parentElement.id);
        ele.remove();  /* 不合要求，销毁 */
      } else {
        this.createElement(event, 'diamond');  /* 对被拖走的元素进行初始化 */
      }
      // 不管拖走的合不合要求，这里都要新建一个
      this.initDiamond();
    });
  }

  // 圆形
  initCircle() {
    let group: any = this.nodes.group().translate(40, 170).draggable(true);
    let circle = this.draw.circle(70).fill("transparent").stroke({ width: 1, color: 'rgba(102,253,251,0.65)' });
    group.add(circle);
    group.on("mouseup", (event: any) => {
      /* 虽然这里是 group 监听事件 */
      if (event.clientX < (360 + this.offsetLeft) && event.clientY < (280 + this.offsetTop)) {
        let ele = SVG.get(event.target.parentElement.id);
        ele.remove();  /* 不合要求，销毁 */
      } else {
        this.createElement(event, 'circle');  /* 对被拖走的元素进行初始化 */
      }
      // 不管拖走的合不合要求，这里都要新建一个
      this.initCircle();
    });
  }

  // 椭圆形
  initEllipse() {
    let group: any = this.nodes.group().translate(280, 92).draggable(true);
    let ellipse = this.draw.ellipse(40, 30).fill("transparent").stroke({ dx:5, width: 1, color: 'rgba(102,253,251,0.65)' });
    group.add(ellipse);
    group.on("mouseup", (event: any) => {
      /* 虽然这里是 group 监听事件 */
      if (event.clientX < (360 + this.offsetLeft) && event.clientY < (280 + this.offsetTop)) {
        let ele = SVG.get(event.target.parentElement.id);
        ele.remove();  /* 不合要求，销毁 */
      } else {
        this.createElement(event, 'ellipse');  /* 对被拖走的元素进行初始化 */
      }
      // 不管拖走的合不合要求，这里都要新建一个
      this.initEllipse();
    });
  }

  // 被创建新元素的初始化
  createElement(event: any, type: string) {
    let element = SVG.get(event.target.id); /* 直接通过 SVG.get(id) 获取该 svg 元素，而不是 dom 节点 */
    let groupElement = SVG.get(event.target.parentElement.id);
    groupElement.off("mouseup"); /* 解绑该新建事件 */
    // 绑定文本
    let text = this.draw.text((add: any) => {
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
    text.on("dblclick", this.doubleClick); /* 这个右键事件要单独绑定，否则会被共享并按 group 里的元素个数执行多次 */
    groupElement.add(text);
    groupElement.on("contextmenu", this.openToolBar);
    groupElement.on("click", this.endLinking);
  }

  // 打开工具栏
  openToolBar(event: any) {
    event.preventDefault();
    if (this.linkButton || this.removeButton) { // 若已存在打开的工具栏
      // 若是再次点击工具栏，则移除并退出
      if (event.target.id === this.linkButton.node.id || event.target.id === this.removeButton.node.id) {
        this.removeToolBar();
        return;
      } else {
        // 移除之前的
        this.removeToolBar();
        // 然后加新的
      }
    }
    // 找出被操作的 group，并把它的id 存到 this.sourceId
    let parentElement = SVG.get(event.target.parentElement.id);
    if (parentElement.type === 'text') {
      parentElement = SVG.get(event.target.parentElement.parentElement.id);
    }
    // 添加连线按钮
    let linkButton = this.draw.image(this.editImg, 50, 30);
    linkButton.on("click", this.startLinking);
    this.linkButton = linkButton;
    parentElement.add(linkButton);
    // 添加删除按钮
    let removeButton = this.draw.image(this.removeImg, 50, 30).move(50, 0);
    removeButton.on("click", this.deleteNode);
    this.removeButton = removeButton;
    parentElement.add(removeButton);
    return;
  }

  // 关闭工具栏
  removeToolBar() {
    if (this.linkButton) {
      this.linkButton.off("click", this.startLinking);
      this.linkButton.remove();
    }
    if (this.removeButton) {
      this.removeButton.off("click", this.startLinking);
      this.removeButton.remove();
    }
  }

  // 开始连线
  startLinking(event: any) {
    if (!this.islinking) {
      // 找出 group，并把它的id 存到 this.sourceId
      let groupElement = SVG.get(event.target.parentElement.id);
      this.sourceId = event.target.parentElement.id;
      // 记录触发事件时鼠标的位置
      this.sourceX = event.clientX;
      this.sourceY = event.clientY;
      // 画跟踪的连接线
      this.islinking = true;
      this.draw.on("mousemove", this.tracingMouse);
      // 关闭工具栏
      this.removeToolBar();
    }
  }

  // 做一条跟踪线并跟随鼠标
  tracingMouse(event: any) {
    // console.log("from:", this.sourceX, this.sourceY);
    // console.log("to:  ", event.clientX, event.clientY);
    if (this.islinking) {
      let sX = this.sourceX - this.offsetLeft;
      let sY = this.sourceY - this.offsetTop;
      let tX = event.clientX - this.offsetLeft;
      let tY = event.clientY - this.offsetTop;
      tX > sX? (tX = tX - 2) : (tX = tX + 2);
      tY > sY? (tY = tY - 2) : (tY = tY + 2);
      if (!this.tracingLine) {
        // 创建线
        this.tracingLine = this.draw.line(sX, sY, tX, tY).stroke({ width: 1, color: "rgba(255,255,255,0.3)" });
        // 使用 Marker 标记画箭头
        let arrow = this.draw.marker(12, 12, (add: any) => {
          add.path('M2,2 L2,11 L10,6 L2,2');
          add.style({
            fill: 'rgba(255,255,255,0.3)'
          });
        });
        this.tracingLine.marker('end', arrow);
        this.draw.add(this.tracingLine);
        this.draw.on("contextmenu", this.cancelLinking);
      } else {
        // 更新线
        this.tracingLine.plot(sX, sY, tX, tY);
      }
    }
  }

  // 左键结束连线
  endLinking(event: any) {
    if (this.islinking && event.target.parentElement) { /* 结束连线 */
      // 定位 group 的 id（因为 tspan 离 group 中间隔了一层 text，要找出来）
      let parentElement = SVG.get(event.target.parentElement.id);
      let parentId;
      if (parentElement.type === 'text') {
        parentId = event.target.parentElement.parentElement.id;
        parentElement = SVG.get(parentId);
      } else {
        parentId = event.target.parentElement.id;
      }
      // 如果两次都点击了同一个 group，就取消本次连线（比较的是 group 的 id）
      if (parentId === this.sourceId) {
        this.islinking = false;
        return;
      }
      // "去掉"跟踪的连接线（只是让这条线不可见）
      this.tracingLine.plot(0, 0, 0, 0).fill("transparent"); /* 更新已创建好的直线用 plot */
      this.tracingLine = undefined;
      this.draw.off("mousemove", this.tracingMouse);
      this.draw.off("contextmenu", this.cancelLinking);  // 连接成功要移除“取消连线”的监听
      // 连线
      let source: any = SVG.get(this.sourceId);
      let target = SVG.get(parentId);
      this.linkThem(source, target);
      source.on("dragmove", this.updateLink); /* 监听被连线的元素的拖动 */
      target.on("dragmove", this.updateLink); /* 热更新连接线 */
      this.islinking = false;
    }
  }

  // 确定原对象和目标对象后创建连接线
  linkThem(source: any, target: any) {
    // 获取源对象的信息
    let sDom: any = document.getElementById(source.node.id);
    let sWidth = sDom.getBBox().width;
    let sHeight = sDom.getBBox().height;
    let sX = source.transform().x;
    let sY = source.transform().y;
    // 获取目标对象的信息
    let tDom: any = document.getElementById(target.node.id);
    let tWidth = tDom.getBBox().width;
    let tHeight = tDom.getBBox().height;
    let tX = target.transform().x;
    let tY = target.transform().y;
    // 计算计算
    let sourceCenterX = sX + sWidth / 2;   // 原对象中心点的 x 坐标
    let sourceCenterY = sY + sHeight / 2;  // 原对象中心点的 y 坐标
    let targetCenterX = tX + tWidth / 2;   // 目标对象中心点的 x 坐标
    let targetCenterY = tY + tHeight / 2;  // 目标对象中心点的 y 坐标
    /** 连接线 */
    let line = this.draw.line(
      sourceCenterX,
      sourceCenterY,
      targetCenterX,
      targetCenterY
    ).stroke({ width: 1, color: "rgba(255,255,255,0.3)" });
    // 使用 Marker 标记画箭头
    let arrow = this.draw.marker(12, 12, (add: any) => {
      add.path('M2,2 L2,11 L10,6 L2,2');
      add.style({
        fill: 'rgba(255,255,255,0.3)'
      });
    });
    line.marker('end', arrow);
    // 保存该线信息
    this.links.push({
      sourceId: source.node.id,
      targetId: target.node.id,
      lineId: line.node.id
    });
  }

  // 拖拉元素时更新该元素相关的已连接的连线
  updateLink(event: any) {
    this.links.forEach((item, index) => {
      /** 拖动的目标有连线存在，则该线要更新了 */
      if (item.sourceId === event.target.id || item.targetId === event.target.id) {
        // 获取源对象的信息
        let sElement: any = SVG.get(item.sourceId);
        let sDom: any = document.getElementById(item.sourceId);
        let sWidth = sDom.getBBox().width;
        let sHeight = sDom.getBBox().height;
        let sX = sElement.transform().x;
        let sY = sElement.transform().y;
        // 获取目标对象的信息
        let tElement: any = SVG.get(item.targetId);
        let tDom: any = document.getElementById(item.targetId);
        let tWidth = tDom.getBBox().width;
        let tHeight = tDom.getBBox().height;
        let tX = tElement.transform().x;
        let tY = tElement.transform().y;
        // 计算计算
        let sourceCenterX = sX + sWidth / 2;   // 原对象中心点的 x 坐标
        let sourceCenterY = sY + sHeight / 2;  // 原对象中心点的 y 坐标
        let targetCenterX = tX + tWidth / 2;   // 目标对象中心点的 x 坐标
        let targetCenterY = tY + tHeight / 2;  // 目标对象中心点的 y 坐标
        // 更新线段
        let line = SVG.get(item.lineId);
        line.plot(sourceCenterX, sourceCenterY, targetCenterX, targetCenterY);
      }
    });
  }

  // 右键取消连线
  cancelLinking(event: any) {
    event.preventDefault();
    if (this.islinking) {
      this.tracingLine.plot(0, 0, 0, 0).fill("transparent"); /* 更新已创建好的直线用 plot */
      this.tracingLine = undefined;
      this.islinking = false;
      this.draw.off("mousemove", this.tracingMouse);
      this.draw.off("contextmenu", this.cancelLinking); // 取消连线要移除“取消连线”的监听
    }
  }

  // 双击，编辑文本
  doubleClick(event: any) {
    let tspan = SVG.get(event.target.id);
    let originCont: string = tspan.node.textContent;
    let input = prompt("请输入节点名称：(节点名称不可为空)", originCont); // 弹出窗口请求输入
    if (input !== null) {
      tspan.clear();
      tspan.text(input);
    } else {
      tspan.clear();
      tspan.text(originCont);
    }
  }

  // 删除节点，以及与它相关的线
  deleteNode(event: any) {
    let groupId = event.target.parentElement.id;
    let group = SVG.get(groupId);
    /* 删除的时候要把与他有关的线全都删了 */
    for (let i = this.links.length - 1; i >= 0; i--) {
      if (this.links[i].sourceId === groupId || this.links[i].targetId === groupId) { // 找出与该节点有关的线
        let line = SVG.get(this.links[i].lineId);
        line.remove();  // 先删除该线
        this.links.splice(i, 1);  // 再删除该节点的连线记录
      }
    }
    group.remove(); // 再删除该节点
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