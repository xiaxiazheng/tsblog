// 后台启动的服务地址
import { baseUrl } from '@/config'
import axios from 'axios'
import Vue from 'vue'

const axiosGetHelper = async (url: string) => {
  let res = await axios.get(url);
  // 拦截下请求失败的情况
  if(!res) {
    console.log("get请求失败");
    return;
  }
  if(res['data']['resultsCode'] === 'error') {
    console.log(res.data.message);
    return;
  }
  return res.data;
}
const axiosPostHelper = async (url: string, params: any) => {
  let res = await axios.post(url, params);
  // 拦截下请求失败的情况
  if(!res) {
    console.log("post请求失败");
    return;
  }
  if(res['data']['resultsCode'] === 'error') {
    console.log(res.data.message);
    return;
  }
  return res.data;
}

export class userClient {
  /** 登录 */
  static postLogin(params: any) {
    return axios.post(baseUrl + '/login', params);
  }
}

/** 操作树 */
export class treeClient {
  static getTree(type: string) {
    let url = baseUrl + '/tree?type=' + type;
    return axiosGetHelper(url);
  }
  static getChildName(params: any) {
    return axios.get(baseUrl + '/getchildname', {params});
  }
  static addTreeNode(params: any) {
    return axios.get(baseUrl + '/addtreenode', {params});
  }
  static modifyTreeNode(params: any) {
    return axios.get(baseUrl + '/modifytreenode', {params});
  }
  static deleteTreeNode(params: any) {
    return axios.get(baseUrl + '/deletetreenode', {params});
  }
  static changeSort(params: any) {
    return axios.get(baseUrl + '/changesort', {params});
  }
  static changeFather(params: any) {
    return axios.get(baseUrl + '/changefather', {params});
  }
}

export class contClient {
  /** 操作子节点内容 */
  static getNodeCont(params: any) {
    return axios.get(baseUrl + '/cont', {params});
  }
  static addNodeCont(params: any) {
    return axios.post(baseUrl + '/addnodecont', params);
  }
  static modifyNodeCont(params: any) {
    return axios.post(baseUrl + '/modifynodecont', params);
  }
  static deleteNodeCont(params: any) {
    return axios.get(baseUrl + '/deletenodecont', {params});
  }
  static changeContSort(params: any) {
    return axios.get(baseUrl + '/changecontsort', {params});
  }
}

export class imgClient {
  /** 获取某个类型的图片名称列表 */
  static getImgList(params: any) {
    return axios.get(baseUrl + '/getimglist', {params});
  }
  static deleteImg(params: any) {
    return axios.get(baseUrl + '/deleteimg', {params});
  }
  static deleteTreeContImg(params: any) {
    return axios.get(baseUrl + '/deletetreecontimg', {params});
  }
}