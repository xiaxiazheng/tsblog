<template>
  <div class="treecont" ref="treecont">
    <div v-if="$route.query.id" class="treecontent">
      <h1>{{title}}</h1>
      <!-- 内容 -->
      <ul>
        <li v-for="(item, index) in contList" :key="index">
          <h2>
            <a
              :class="{ 'activeSearch': $route.query.searchSort == item.sort }"
              :href="`#${cId}-${item.sort}`"
              :name="`${cId}-${item.sort}`">
              {{item.title}}
            </a>
            <span v-if="contList">
              修改时间：
              <span>{{item.motifytime}}</span>
            </span>
          </h2>
          <p v-html="item.cont" v-highlight></p>
          <div v-for="(jtem, jndex) of item.imgList" :key="jndex" class="imgbox">
            <img
              :src="`${baseImgUrl}${jtem.imgfilename}`" :alt="jtem.imgname"
              @click="showBigImg(baseImgUrl + jtem.imgfilename, jtem.imgname)" title="点击查看大图">
            <span>{{ jtem.imgname }}</span>
          </div>
        </li>
      </ul>
      <!-- 右边的锚点们 -->
      <div class="mao">
        <a
          v-for="(item, index) of contList"
          :key="index"
          :class="{ 'activeSearch': $route.query.searchSort == item.sort }"
          :href="`#${cId}-${item.sort}`">{{item.title}}</a>
      </div>
      <!-- 查看大图的 dialog -->
      <el-dialog class="previewImage" :visible.sync="dialogVisible" :title="dialogImageName">
        <img width="100%" :src="dialogImageUrl" :alt="dialogImageName" :title="dialogImageName">
      </el-dialog>
    </div>
    <div v-else class="treemainbox">
      <TreeMain type="home" @scrollToTop="scrollToTop"></TreeMain>
    </div>
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { TreeHelper } from '@/client/TreeHelper';
import { TreeContHelper } from '@/client/TreeContHelper';
import { baseImgUrl } from "../../config";
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
  cId: string = '';
  contList: any[] = [];
  baseImgUrl: string = `${baseImgUrl}/treecont/`;
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
      this.$router.push({ query: {} });
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
    if (this.$route.query.id) {
      // 获取当前内容节点的id
      this.cId = decodeURIComponent(atob(<string>this.$route.query.id));
      // 获取当前内容节点的标题
      let res0 = await TreeHelper.getChildName(this.cId); // 获取当前节点的名称
      this.title = res0.length !== 0 ? res0[0].c_label : '';
      // 获取当前内容节点的内容列表
      let res = await TreeContHelper.getNodeCont(this.cId);
      if (!res) return;
      this.contList = res;
      for (let item of this.contList) {
        item.cont = item.cont.replace(/</g, "&lt;"); // html标签的<转成实体字符,让所有的html标签失效
        item.cont = item.cont.replace(/&lt;pre/g, "<pre"); // 把pre标签转回来
        item.cont = item.cont.replace(/pre>\n/g, "pre>"); // 把pre后面的空格去掉
        item.cont = item.cont.replace(/&lt;\/pre>/g, "</pre>"); // 把pre结束标签转回来
        item.cont = item.cont.replace(/  /g, "&nbsp;&nbsp;"); // 把空格转成实体字符，以防多空格被合并
        item.cont = item.cont.replace(/\n|\r\n/g, "<br/>"); // 把换行转成br标签
      }
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
@splitWidth: 500px;

// PC 端
@media screen and (min-width: @splitWidth) {
  .treecont {
    padding: 10px;
    text-align: left;
    line-height: 1.5;
    .treecontent {
      width: 67%;
      margin: 0 auto;
      h1 {
        margin-bottom: 10px;
      }
      h2 {
        position: relative;
        margin-bottom: 5px;
        border-bottom: 1px solid #eaecef;
        box-sizing: border-box;
        > a {
          display: inline-block;
          height: 40px;
          line-height: 40px;
          &.activeSearch {
            color: #ecac61;
          }
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
            max-width: 70%;
            margin: 0 auto 5px;
            overflow: hidden;
            text-align: center;
            img {
              max-width: 100%;
              display: inherit;
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
        margin: 0 0 0.6rem 1px;
        font-size: 1rem;
        line-height: 1.7;
        word-break: break-all;
      }

      .mao {
        position: fixed;
        top: 115px;
        right: 8px;
        max-width: calc((100% - 20rem) * 0.15 - 11px);
        max-height: calc(100% - 3.6rem - 130px);
        padding-right: 3px;
        text-align: right;
        opacity: 0.3;
        overflow-y: auto;
        >a {
          display: block;
          min-height: 20px;
          margin: 2px;
          border-bottom: 1px solid #c0c5cb;
          &.activeSearch {
            color: #ecac61;
          }
        }
        &:hover {
          opacity: 0.9;
        }
        &::-webkit-scrollbar {
          /*滚动条整体样式*/
          width: 3px; /* 高宽分别对应横竖滚动条的尺寸 */
          height: 7px;
        }
        &::-webkit-scrollbar-thumb {
          /*滚动条里面小方块*/
          border-radius: 0.5rem;
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
          -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
          background: #d2d5dc;
        }
        &::-webkit-scrollbar-track {
          /*滚动条里面轨道*/
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
          -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
          border-radius: 0.5rem;
          background: white;
        }
      }
    
      pre {
        margin: 0;
        font-size: 0.9rem !important;
        overflow-x: auto;
        padding: 3px 1rem;
        white-space: pre;
        word-wrap: normal;
        border: 1px solid black;
        border-radius: 4px;
        font-size: 0.859rem;
        font-family: Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console",
          "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono",
          "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier,
          monospace;
        &::-webkit-scrollbar {
          /*滚动条整体样式*/
          width: 7px; /* 高宽分别对应横竖滚动条的尺寸 */
          height: 7px;
        }
        &::-webkit-scrollbar-thumb {
          /*滚动条里面小方块*/
          border-radius: 0.5rem;
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
          -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
          background: white;
        }
        &::-webkit-scrollbar-track {
          /*滚动条里面轨道*/
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
          -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
          border-radius: 0.5rem;
          background: #282c34;
        } 
      }
    }
    .treemainbox {
      width: 67%;
      margin: 0 auto;
    }
  }
}
// 移动端
@media screen and (max-width: @splitWidth) {
  .treecont {
    padding: 10px;
    text-align: left;
    line-height: 1.5;
    .treecontent {
      h1 {
        font-size: 17px;
        margin-bottom: 2px;
        padding-right: 20px;
      }
      h2 {
        font-size: 14px;
        padding: 7px 0 2px;
        margin-bottom: 5px;
        border-bottom: 1px solid #eaecef;
        box-sizing: border-box;
        > span {
          display: none;
        }
      }
      ul {
        margin-top: 5px;
        li {
          margin: 5px 0;
          .imgbox {
            max-width: 70%;
            margin: 0 auto;
            overflow: hidden;
            text-align: center;
            img {
              max-width: 100%;
              display: inherit;
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
        font-size: 13px;
        letter-spacing: 1px;
        line-height: 1.7;
        margin: 0 0 0.6rem 1px;
        word-break: break-all;
      }

      .mao {
        display: none;
      }

      .previewImage {
        text-align: center;
      }
    
      pre {
        margin: 0;
        font-size: 12px !important;
        overflow-x: auto;
        padding: 6px;
        white-space: pre;
        word-wrap: normal;
        border: 1px solid black;
        border-radius: 4px;
        font-size: 0.859rem;
        font-family: Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console",
          "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono",
          "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier,
          monospace;
      }
    }
  }
}
</style>