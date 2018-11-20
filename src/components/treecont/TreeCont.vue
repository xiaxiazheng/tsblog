<template>
  <div class="treecont" ref="treecont">
    <div v-if="$route.query.id" class="treecontent">
      <h1>{{title}}</h1>
      <ul>
        <li v-for="(item, index) in contObj.list" :key="index">
          <h2>
            <a :href="'#' + item.title + item.sort" :name="item.title + item.sort">{{item.title}}</a>
            <span v-if="contObj.list">
              修改时间：
              <span>{{item.motifytime}}</span>
            </span>
          </h2>
          <p v-html="item.cont" v-highlight></p>
          <div v-if="item.filename" class="imgbox">
            <img :src="baseImgUrl + item.filename" :alt="getRealImgName(item.filename)" @click="showBigImg(baseImgUrl + item.filename, getRealImgName(item.filename))" title="点击查看大图">
            <span>{{ getRealImgName(item.filename) }}</span>
          </div>
        </li>
      </ul>
      <!-- 右边的锚点们 -->
      <div class="mao">
        <a v-for="(item, index) in contObj.list" :key="index" :href="'#' + item.title + item.sort">{{item.title}}</a>
      </div>
      <!-- 查看大图的 dialog -->
      <el-dialog width="40%" :visible.sync="dialogVisible" :title="dialogImageName">
        <img width="100%" :src="dialogImageUrl" :alt="dialogImageName" :title="dialogImageName">
      </el-dialog>
    </div>
    <div v-else>
      <TreeMain type="home" @scrollToTop="scrollToTop"></TreeMain>
    </div>
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { TreeClient, ContClient } from '../../util/clientHelper';
import { baseUrl } from "../../config";
import TreeMain from '@/components/TreeMain.vue';

interface ContType {
  list: any[];
}

@Component({
  components: {
    TreeMain
  },
})
export default class TreeCont extends Vue {
  @Prop() propsname: any;
  @Prop() isPC: any;

  title: string = "";
  contObj: ContType = {
    list: []
  };
  baseImgUrl: string = `${baseUrl}/treecont/`;
  dialogVisible: boolean = false;
  dialogImageName: string = "";
  dialogImageUrl: string = "";

  mounted() {
    this.$nextTick(function () {
      this.init();
    });
  }

  @Watch('propsname')
  onPropsNameChanged() {
    if (this.propsname !== "") {
      this.title = this.propsname;
    } else {
      this['$router'].push({ query: {} });
    }
  }

  @Watch('$route')
  onRouteChanged() { // 路由变化要监听
    this.init();
  }

  // 子组件冒上来调用父组件的方法
  scrollToTop() {
    this.$emit('scrollToTop');
  }

  async init() {
    if (this["$route"].query.id) {
      let id = decodeURIComponent(atob(this["$route"].query.id));

      let res0 = await TreeClient.getChildName(id); // 获取当前节点的名称
      if (!res0) return;
      this.title = res0.data[0].c_label;

      let res = await ContClient.getNodeCont(id);
      if (!res) return;
      this.contObj = res.data;
      for (let i in this.contObj["list"]) {
        this.contObj["list"][i].cont = this.contObj["list"][i].cont.replace(/</g, "&lt;"); // html标签的<转成实体字符,让所有的html标签失效
        this.contObj["list"][i].cont = this.contObj["list"][i].cont.replace(/&lt;pre/g, "<pre"); // 把pre标签转回来
        this.contObj["list"][i].cont = this.contObj["list"][i].cont.replace(/pre>\n/g, "pre>"); // 把pre后面的空格去掉
        this.contObj["list"][i].cont = this.contObj["list"][i].cont.replace(/&lt;\/pre>/g, "</pre>"); // 把pre结束标签转回来
        this.contObj["list"][i].cont = this.contObj["list"][i].cont.replace(/  /g, "&nbsp;&nbsp;"); // 把空格转成实体字符，以防多空格被合并
        this.contObj["list"][i].cont = this.contObj["list"][i].cont.replace(/\n|\r\n/g, "<br/>"); // 把换行转成br标签
      }
    }
  }

  /* 获取文件原本的名称，没有id没有后缀那种 */
  getRealImgName(filename: any) {
    if (filename) {
      let list = filename.split(".");
      let filetype = list[list.length - 1]; // 文件类型
      let randomNum = list[list.length - 2];
      let originname = filename.substr(0, filename.length - filetype.length - randomNum.length - 2 - decodeURIComponent(atob(this["$route"].query.id)).length);
      return originname;
    }
  }

  /* 点击查看大图 */
  showBigImg(imgurl: any, imgname: any) {
    this.dialogImageUrl = imgurl;
    this.dialogImageName = imgname;
    this.dialogVisible = true;
  }
}
</script>

<style lang="less">
  .treecont {
    padding: 10px;
    text-align: left;
    line-height: 1.5;
    .treecontent {
      h1 {
        margin-bottom: 10px;
        padding-right: 20px;
      }
      h2 {
        position: relative;
        border-bottom: 1px solid #eaecef;
        box-sizing: border-box;
        > a {
          display: inline-block;
          height: 40px;
          line-height: 40px;
        }
        > span {
          position: absolute;
          right: 0;
          bottom: 0.3rem;
          font-size: 0.8rem;
          color: #ccc;
        }
      }
      ul {
        margin-top: 20px;
        li {
          margin: 20px 0;
          .imgbox {
            height: 314px;
            margin: 0 auto;
            overflow: hidden;
            text-align: center;
            img {
              display: inherit;
              height: calc(100% - 14px);
              margin: 0 auto;
              cursor: pointer;
            }
            span {
              font-size: 12px;
              color: #ccc;
            }
          }
        }
      }
      p {
        font-size: 1rem;
        line-height: 1.7;
        margin-bottom: 0.6rem;
      }

      .mao {
        position: fixed;
        top: 70px;
        right: 12px;
        text-align: right;
        opacity: 0.3;
        >a {
          display: block;
          margin: 2px;
        }
      }
      .mao:hover {
        opacity: 1;
      }
    
      pre {
        margin: 0;
        font-size: 0.9rem !important;
        overflow-x: auto;
        padding: 3px 1rem;
        white-space: pre;
        word-wrap: normal;
        border: 1px solid black;
        border-radius: 0.5rem;
        font-size: 0.859rem;
        font-family: Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console",
          "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono",
          "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier,
          monospace;
      }
      pre::-webkit-scrollbar {
        /*滚动条整体样式*/
        width: 7px; /* 高宽分别对应横竖滚动条的尺寸 */
        height: 7px;
      }
      pre::-webkit-scrollbar-thumb {
        /*滚动条里面小方块*/
        border-radius: 0.5rem;
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        background: white;
      }
      pre::-webkit-scrollbar-track {
        /*滚动条里面轨道*/
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        border-radius: 0.5rem;
        background: #282c34;
      }
    }
    
    .el-dialog {
      max-width: 800px;
      min-width: 400px;
    }
  }
</style>