const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
  // assetsDir: "static", // 会全部打包到static文件夹中
  configureWebpack: {
    mode: 'production',
    performance: {
      hints:false
    },
    plugins: [
      // new BundleAnalyzerPlugin()  // 这个如果不是要打包查看打包情况的话还是注释掉吧
    ],
    /* 外部拓展：左边是从 nodemodules 被 import 时的名字，右边是从项目中使用时的名字，这样就不会被 webpack 打包  */
    externals:{
      'vue': 'Vue',
      'element-ui': 'ELEMENT',
      'highlight.js': 'hljs',
      'vue-router': 'VueRouter',
      'axios': "axios",
      "vuex": "Vuex",
      "vue2-editor": "Vue2Editor",
      "gojs": "go",
    },
  }
}