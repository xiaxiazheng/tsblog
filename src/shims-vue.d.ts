declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

// 这样一写引用库就不需要声明文件了
declare module 'vuex-pathify';
declare module 'marked';
declare module 'quill';
declare module 'vue-quill-editor';
declare module 'quill-image-resize-module';


