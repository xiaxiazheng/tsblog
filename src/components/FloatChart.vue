/*
 *@author: 郑演彬
 *@date: 2018-12-13
 *@description: 应急资源管理系统 -> 应急预案 -> 流程配置 -> 流程图组件
 */
<template>
  <div id="floatchartbox">
    <div class="chartbox">
      <!-- 调色板 -->
      <div id="myPaletteDiv"></div>
      <!-- 流程图 -->
      <div id="floatchart"></div>
    </div>
    <!-- 保存按钮 -->
    <button id="SaveButton" @click="save">Save</button>
    <!-- 加载按钮 -->
    <button @click="load">Load</button>
    Diagram Model saved in JSON format:
    <!-- 将图标转换成 svg 并打印 -->
    <button @click="printDiagram">Print Diagram Using SVG</button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Getter, Action } from 'vuex-class';
import go from 'gojs';

let $: any;
let myDiagram: any;

@Component({
  components: {
  }
})
export default class FloatChart extends Vue {
  modeldata: any = {
    "class": "go.GraphLinksModel",
    "linkFromPortIdProperty": "fromPort",
    "linkToPortIdProperty": "toPort",
    "nodeDataArray": [
      { "key":-13, "category":"Comment", "loc":"360 -10", "text":"这是备注" },
      { "key":-1, "category":"Start", "loc":"175 0", "text":"Start" },
      { "key":0, "loc":"-5 75", "text":"Preheat oven to 375 F" },
      { "key":1, "category":"Child", "loc":"175 100", "text":"In a bowl, blend: 1 cup margarine, 1.5 teaspoon vanilla, 1 teaspoon salt" },
      { "key":2, "loc":"175 200", "text":"Gradually beat in 1 cup sugar and 2 cups sifted flour" },
      { "key":3, "category":"Child", "loc":"175 290", "text":"Mix in 6 oz (1 cup) Nestle's Semi-Sweet Chocolate Morsels" },
      { "key":4, "loc":"175 380", "text":"Press evenly into ungreased 15x10x1 pan" },
      { "key":5, "loc":"355 85", "text":"Finely chop 1/2 cup of your choice of nuts" },
      { "key":6, "loc":"175 450", "text":"Sprinkle nuts on top" },
      { "key":7, "loc":"175 515", "text":"Bake for 25 minutes and let cool" },
      { "key":8, "loc":"175 585", "text":"Cut into rectangular grid" },
      { "key":-2, "category":"End", "loc":"175 660", "text":"Enjoy!" }
    ],
    "linkDataArray": [
      { "from":1, "to":2, "fromPort":"B", "toPort":"T" },
      { "from":2, "to":3, "fromPort":"B", "toPort":"T" },
      { "from":3, "to":4, "fromPort":"B", "toPort":"T" },
      { "from":4, "to":6, "fromPort":"B", "toPort":"T" },
      { "from":6, "to":7, "fromPort":"B", "toPort":"T" },
      { "from":7, "to":8, "fromPort":"B", "toPort":"T" },
      { "from":8, "to":-2, "fromPort":"B", "toPort":"T" },
      { "from":-1, "to":0, "fromPort":"B", "toPort":"T" },
      { "from":-1, "to":1, "fromPort":"B", "toPort":"T" },
      { "from":-1, "to":5, "fromPort":"B", "toPort":"T" },
      { "from":5, "to":4, "fromPort":"B", "toPort":"T" },
      { "from":0, "to":4, "fromPort":"B", "toPort":"T" }
    ]
  };

  mounted() {
    this.$nextTick(function () {
      $ = go.GraphObject.make;  // for conciseness in defining templates 为了能简洁的定义模板
      myDiagram =
        $(go.Diagram,
          "floatchart",  // must name or refer to the DIV HTML element
          {
            initialContentAlignment: go.Spot.Center,
            allowDrop: true,  // must be true to accept drops from the Palette
            "LinkDrawn": this.showLinkLabel,  // this DiagramEvent listener is defined below
            "LinkRelinked": this.showLinkLabel,
            scrollsPageOnFocus: false,
            "undoManager.isEnabled": true  // enable undo & redo
          }
        );
      this.init();
    });
  }

  init() {
    // 当流程图被修改了, 添加一个"*"到 save 按钮并使该按钮可点击
    myDiagram.addDiagramListener("Modified", (e: any) => {
      let button: any = document.getElementById("SaveButton");
      if (button) button.disabled = !myDiagram.isModified;
      let idx = button.value.indexOf("*");
      if (myDiagram.isModified) {
        if (idx < 0) button.value += "*";
      } else {
        if (idx >= 0) button.value = button.value.substr(0, idx);
      }
    });

    // 工具栏的配置 a context menu is an Adornment with a bunch of buttons in them
    let partContextMenu = $(
      go.Adornment,
      "Vertical",
      this.makeButton(
        "Delete",
        (e: any, obj: any) => { e.diagram.commandHandler.deleteSelection(); },
        (o: any) => { return o.diagram.commandHandler.canDeleteSelection(); }
      ),
    );

    // 模板一：矩形，主流程，定义为 “” 作为常规节点的节点模板
    myDiagram.nodeTemplateMap.add(
      "",
      $(go.Node, "Table", this.nodeStyle(),
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        $(go.Panel, "Auto",
          $(go.Shape, "Rectangle", { fill: "#00A9C9", strokeWidth: 0 },
            new go.Binding("figure", "figure")
          ),
          $(go.TextBlock,
            this.textStyle(),
            {
              margin: 8,
              maxSize: new go.Size(160, NaN),
              wrap: go.TextBlock.WrapFit,
              editable: true
            },
            new go.Binding("text").makeTwoWay()
          ),
          { // 工具栏
            toolTip:
              $(go.Adornment, "Auto",
                $(go.Shape, { fill: "#FFFFCC" }),
                $(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling nodeInfo(data)
                  new go.Binding("text", "", this.nodeInfo))
              ),
            contextMenu: partContextMenu
          }
        ),
        // 四个方位都可连线
        this.makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
        this.makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
        this.makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
        this.makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
      )
    );

    // 模板二：矩形，子流程
    myDiagram.nodeTemplateMap.add(
      "Child",
      $(go.Node, "Table", this.nodeStyle(),
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        $(go.Panel,
          "Auto",
          $(go.Shape,
            "Rectangle",
            { fill: "#ccc", strokeWidth: 0 },
            new go.Binding("figure", "figure")
          ),
          $(go.TextBlock, 
            this.textStyle(),
            {
              margin: 8,
              maxSize: new go.Size(160, NaN),
              wrap: go.TextBlock.WrapFit,
              editable: true
            },
            new go.Binding("text").makeTwoWay()
          ),
          { // 工具栏
            toolTip:
              $(go.Adornment, "Auto",
                $(go.Shape, { fill: "#FFFFCC" }),
                $(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling nodeInfo(data)
                  new go.Binding("text", "", this.nodeInfo))
              ),
            contextMenu: partContextMenu
          }
        ),
        // 四个方位都可连线
        this.makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
        this.makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
        this.makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
        this.makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
      )
    );

    // 模板三：菱形，条件选择模板
    myDiagram.nodeTemplateMap.add(
      "Conditional",
      $(go.Node, "Table",
        this.nodeStyle(),
        $(go.Panel,
          "Auto",
          $(go.Shape,
            "Diamond",
            { fill: "#00A9C9", strokeWidth: 0 },
            new go.Binding("figure", "figure")
          ),
          $(go.TextBlock,
            this.textStyle(),
            {
              margin: 2,
              maxSize: new go.Size(160, NaN),
              wrap: go.TextBlock.WrapFit,
              editable: true
            },
            new go.Binding("text").makeTwoWay()
          ),
          { // 工具栏
            toolTip:
              $(go.Adornment, "Auto",
                $(go.Shape, { fill: "#FFFFCC" }),
                $(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling nodeInfo(data)
                  new go.Binding("text", "", this.nodeInfo))
              ),
            contextMenu: partContextMenu
          }
        ),
        // 四个方位都可连线
        this.makePort("T", go.Spot.Top, go.Spot.Top, false, true),
        this.makePort("L", go.Spot.Left, go.Spot.Left, true, true),
        this.makePort("R", go.Spot.Right, go.Spot.Right, true, true),
        this.makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
      )
    );

    // 模板四：绿圆，开始模板
    myDiagram.nodeTemplateMap.add(
      "Start",
      $(go.Node,
        "Table",
        this.nodeStyle(),
        $(go.Panel,
          "Auto",
          $(go.Shape, "Circle", { minSize: new go.Size(40, 40), fill: "#79C900", strokeWidth: 0 }),
          $(go.TextBlock, "Start", this.textStyle(), new go.Binding("text")),
          { // 工具栏
            toolTip:
              $(go.Adornment, "Auto",
                $(go.Shape, { fill: "#FFFFCC" }),
                $(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling nodeInfo(data)
                  new go.Binding("text", "", this.nodeInfo))
              ),
            contextMenu: partContextMenu
          }
        ),
        // 除了顶部外，左右和底部都可连线
        this.makePort("L", go.Spot.Left, go.Spot.Left, true, false),
        this.makePort("R", go.Spot.Right, go.Spot.Right, true, false),
        this.makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
      )
    );

    // 模板五：红圆，结束模板
    myDiagram.nodeTemplateMap.add(
      "End",
      $(go.Node,
        "Table",
        this.nodeStyle(),
        $(go.Panel,
          "Auto",
          $(go.Shape, "Circle", { minSize: new go.Size(40, 40), fill: "#DC3C00", strokeWidth: 0 }),
          $(go.TextBlock, "End", this.textStyle(), new go.Binding("text")),
          { // 工具栏
            toolTip:
              $(go.Adornment, "Auto",
                $(go.Shape, { fill: "#FFFFCC" }),
                $(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling nodeInfo(data)
                  new go.Binding("text", "", this.nodeInfo))
              ),
            contextMenu: partContextMenu
          }
        ),
        // 除了底部外，左右和顶部都可连线
        this.makePort("T", go.Spot.Top, go.Spot.Top, false, true),
        this.makePort("L", go.Spot.Left, go.Spot.Left, false, true),
        this.makePort("R", go.Spot.Right, go.Spot.Right, false, true)
      )
    );

    // 模板六：备注模板，不可连线
    myDiagram.nodeTemplateMap.add(
      "Comment",
      $(go.Node,
        "Auto",
        this.nodeStyle(),
        $(go.Shape, "File", { fill: "#EFFAB4", strokeWidth: 0 }),
        $(go.TextBlock,
          this.textStyle(),
          {
            margin: 5,
            maxSize: new go.Size(200, NaN),
            wrap: go.TextBlock.WrapFit,
            textAlign: "center",
            editable: true,
            font: "bold 12pt Helvetica, Arial, sans-serif",
            stroke: '#454545'
          },
          new go.Binding("text").makeTwoWay(),
          { // 工具栏
            toolTip:
              $(go.Adornment, "Auto",
                $(go.Shape, { fill: "#FFFFCC" }),
                $(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling nodeInfo(data)
                  new go.Binding("text", "", this.nodeInfo))
              ),
            contextMenu: partContextMenu
          }
        )
        // 无接口，备注不允许连线
      )
    );

    // 连接线模板：在 linkTemplateMap 中替换默认设置
    myDiagram.linkTemplate = $(
      go.Link,  // the whole link panel
      {
        routing: go.Link.AvoidsNodes,
        curve: go.Link.JumpOver,
        corner: 5, toShortLength: 4,
        relinkableFrom: true,
        relinkableTo: true,
        reshapable: true,
        resegmentable: true,
        // mouse-overs subtly highlight links:
        mouseEnter (e: any, link: any) { link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"; },
        mouseLeave (e: any, link: any) { link.findObject("HIGHLIGHT").stroke = "transparent"; },
        selectionAdorned: false
      },
      new go.Binding("points").makeTwoWay(),
      // the highlight shape, normally transparent
      $(go.Shape, { isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }),
      // the link path shape
      $(go.Shape,
        { isPanelMain: true, stroke: "gray", strokeWidth: 2 },
        new go.Binding("stroke", "isSelected", (sel: any) => { return sel ? "dodgerblue" : "gray"; }).ofObject()
      ),
      // the arrowhead
      $(go.Shape, { toArrow: "standard", strokeWidth: 0, fill: "gray" }),
      // the link label, normally not visible
      $(go.Panel,
        "Auto",
        { visible: false, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5 },
        new go.Binding("visible", "visible").makeTwoWay(),
        // the label shape
        $(go.Shape, "RoundedRectangle", { fill: "#F8F8F8", strokeWidth: 0 }),
        // the label
        $(go.TextBlock,
          "Yes",
          {
            textAlign: "center",
            font: "10pt helvetica, arial, sans-serif",
            stroke: "#333333",
            editable: true
          },
          new go.Binding("text").makeTwoWay(),
        )
      ),
      {
        toolTip:
          $(go.Adornment, "Auto",
            $(go.Shape, { fill: "#FFFFCC" }),
            $(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling linkInfo(data)
              new go.Binding("text", "", this.linkInfo))
          ),
        contextMenu: partContextMenu
      }
    );
    
    // temporary links used by LinkingTool and RelinkingTool are also orthogonal:
    myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
    myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;
    this.load();  // 加载 JSON 数据，初始化

    // 在页面的左边初始化"调色板"，也就是可拖拉模板
    let myPalette = $(go.Palette, "myPaletteDiv", { // 必须传 div 节点的 id 或者直接传 div 节点
      scrollsPageOnFocus: false,
      nodeTemplateMap: myDiagram.nodeTemplateMap, // 把刚刚图表内定义的模板们放这里
      model: new go.GraphLinksModel([  // specify the contents of the Palette
        { category: "Start", text: "Start" },
        { category: "", text: "主流程" },
        { category: "Child", text: "子流程" },
        { category: "Conditional", text: "是/否" },
        { category: "End", text: "End" },
        { category: "Comment", text: "备注" }
      ])
    });
  } // end init

  // 定义工具栏的按钮 To simplify this code we define a function for creating a context menu button:
  makeButton(text: any, action: any, visiblePredicate: any) {
    return $(
      "ContextMenuButton",
      $(go.TextBlock, text),
      { click: action },
      // don't bother with binding GraphObject.visible if there's no predicate
      visiblePredicate ? new go.Binding("visible", "", (o: any, e: any) => { return o.diagram ? visiblePredicate(o, e) : false; }).ofObject() : {}
    );
  }

  // 辅助节点模板的删除
  nodeInfo(d: any) {  // Tooltip info for a node data object
    let str = `Node ${d.key}: ${d.text}\n`;
    if (d.group) {
      str += `member of ${d.group}`;      
    } else {
      str += "top-level node";
    }
    return str;
  }

  // 辅助连接线的删除
  linkInfo(d: any) {  // Tooltip info for a link data object
    return `Link:\nfrom ${d.from} to ${d.to}`;
  }

  // 保存图表数据成 JSON
  save() {
    this.modeldata = myDiagram.model.toJson();
    console.log(this.modeldata);
    myDiagram.isModified = false;
  }

  // 加载 JSON 数据到图表
  load() {
    myDiagram.model = go.Model.fromJson(this.modeldata);
  }

  // 新打开一个标签页，并将图标转换成 svg 以便打印
  printDiagram() {
    let svgWindow: any = window.open();
    if (!svgWindow) return;  // failure to open a new Window
    let printSize = new go.Size(700, 960);
    let bnds = myDiagram.documentBounds;
    let x = bnds.x;
    let y = bnds.y;
    while (y < bnds.bottom) {
      while (x < bnds.right) {
        let svg = myDiagram.makeSVG({ scale: 1.0, position: new go.Point(x, y), size: printSize });
        svgWindow.document.body.appendChild(svg);
        x += printSize.width;
      }
      x = bnds.x;
      y += printSize.height;
    }
    // setTimeout(function () { svgWindow.print(); }, 1); /* 打开打印程序 */
  }

  // helper definitions for node templates
  nodeStyle() {
    return [
      // The Node.location comes from the "loc" property of the node data,
      // converted by the Point.parse static method.
      // If the Node.location is changed, it updates the "loc" property of the node data,
      // converting back using the Point.stringify static method.
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      {
        // the Node.location is at the center of each node
        locationSpot: go.Spot.Center
      }
    ];
  }

  // Define a function for creating a "port" that is normally transparent.
  // The "name" is used as the GraphObject.portId,
  // the "align" is used to determine where to position the port relative to the body of the node,
  // the "spot" is used to control how links connect with the port and whether the port
  // stretches along the side of the node,
  // and the boolean "output" and "input" arguments control whether the user can draw links from or to the port.
  makePort(name: any, align: any, spot: any, output: any, input: any) {
    let horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);
    // the port is basically just a transparent rectangle that stretches along the side of the node,
    // and becomes colored when the mouse passes over it
    return $(
      go.Shape,
      {
        fill: "transparent",  // changed to a color in the mouseEnter event handler
        strokeWidth: 0,  // no stroke
        width: horizontal ? NaN : 8,  // if not stretching horizontally, just 8 wide
        height: !horizontal ? NaN : 8,  // if not stretching vertically, just 8 tall
        alignment: align,  // align the port on the main Shape
        stretch: (horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical),
        portId: name,  // declare this object to be a "port"
        fromSpot: spot,  // declare where links may connect at this port
        fromLinkable: output,  // declare whether the user may draw links from here
        toSpot: spot,  // declare where links may connect at this port
        toLinkable: input,  // declare whether the user may draw links to here
        cursor: "pointer",  // show a different cursor to indicate potential link point
        mouseEnter (e: any, port: any) {  // the PORT argument will be this Shape
          if (!e.diagram.isReadOnly) port.fill = "rgba(255,0,255,0.5)";
        },
        mouseLeave (e: any, port: any) {
          port.fill = "transparent";
        }
      }
    );
  }

  textStyle() {
    return {
      font: "bold 11pt Helvetica, Arial, sans-serif",
      stroke: "whitesmoke"
    };
  }

  // Make link labels visible if coming out of a "conditional" node.
  // This listener is called by the "LinkDrawn" and "LinkRelinked" DiagramEvents.
  showLinkLabel(e: any) {
    let label = e.subject.findObject("LABEL");
    if (label !== null) {
      label.visible = (e.subject.fromNode.data.category === "Conditional");
    }
  }
}
</script>

<style lang="less">
  #floatchartbox {
    height: 100%;
    .chartbox {
      display: flex;
      #myPaletteDiv {
        width: 100px;
        height: 800px;
        margin-right: 2px;
        border: solid 1px #ccc;
      }
      #floatchart {
        width: 800px;
        height: 800px;
        border: 1px solid #ccc;
      }
    }
  }
</style>