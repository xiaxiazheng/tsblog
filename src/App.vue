<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<style lang="less">
html {height: 100%;}
body,ul,ol,li,p,h1,h2,h3,h4,h5,h6,form,fieldset,table,td,img,div {margin:0;padding:0;} 
body {background:#fff;color:#333;font-size:12px;font-family:"SimSun","宋体","Arial Narrow";height:100%;} 
  
ul,ol {list-style-type:none;} 
select,input,img,select {vertical-align:middle;} 
  
a {text-decoration:none;} 
a:link {color: #2c3e50;} 
a:visited {color: #2c3e50;} 
a:hover,a:active,a:focus {color:#409eff;}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
