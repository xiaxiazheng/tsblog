// 后台启动的服务地址
import { baseUrl } from '@/config';
import axios from 'axios';

const axiosGetHelper = async (url: string) => {
  let res = await axios.get(url);
  // 拦截下请求失败的情况
  if (!res) {
    console.log("get请求失败");
    return;
  }
  if (res['data']['resultsCode'] === 'error') {
    console.log(res.data.message);
    return;
  }
  return res.data;
};

const axiosPostHelper = async (url: string, params: any) => {
  let res = await axios.post(url, params);
  // 拦截下请求失败的情况
  if (!res) {
    console.log("post请求失败");
    return;
  }
  if (res['data']['resultsCode'] === 'error') {
    console.log(res.data.message);
    return;
  }
  return res.data;
};

/** 用户 */
export class UserClient {
  static postLogin(username: any, userpword: any) {
    let url = `${baseUrl}/login`;
    let params = {
      username,
      userpword
    };
    return axiosPostHelper(url, params);
  }
}

/** 操作树 */
export class TreeClient {
  static getTree(type: string) {
    let url = `${baseUrl}/tree?type=${type}`;
    return axiosGetHelper(url);
  }
  static getChildName(id: string) {
    let url = `${baseUrl}/getchildname?id=${id}`;
    return axiosGetHelper(url);
  }
  static addTreeNode(params: any) {
    let url = `${baseUrl}/addtreenode`;
    return axios.get(url, { params });
  }
  static modifyTreeNode(id: any, label: any, level: any) {
    let url = `${baseUrl}/modifytreenode?id=${id}&label=${label}&level=${level}`;
    return axiosGetHelper(url);
  }
  static deleteTreeNode(id: string, level: any) {
    let url = `${baseUrl}/deletetreenode?id=${id}&level=${level}`;
    return axiosGetHelper(url);
  }
  static changeSort(level: any, thisId: any, thisSort: any, otherId: any, otherSort: any) {
    let url = `${baseUrl}/changesort?
    level=${level}&thisId=${thisId}&thisSort=${thisSort}&otherId=${otherId}&otherSort=${otherSort}`;
    return axiosGetHelper(url);
  }
  static changeFather(params: any) {
    return axios.get(`${baseUrl}/changefather`, { params });
  }
}

export class ContClient {
  /** 操作子节点内容 */
  static getNodeCont(id: any) {
    let url = `${baseUrl}/cont?id=${id}`;
    return axiosGetHelper(url);
  }
  static addNodeCont(id: string, sort: any) {
    let url = `${baseUrl}/addnodecont`;
    let params = {
      id,
      sort
    };
    return axiosPostHelper(url, params);
  }
  static modifyNodeCont(obj: any) {
    let params = obj;
    return axiosPostHelper(`${baseUrl}/modifynodecont`, params);
  }
  static deleteNodeCont(id: string, sort: any) {
    let url = `${baseUrl}/deletenodecont?id=${id}&sort=${sort}`;
    return axiosGetHelper(url);
  }
  static changeContSort(thiscTime: string, thisSort: any, othercTime: string, otherSort: any) {
    let url = `${baseUrl}/changecontsort?
    thiscTime=${thiscTime}&thisSort=${thisSort}&othercTime=${othercTime}&otherSort=${otherSort}`;
    return axiosGetHelper(url);
  }
}

export class ImgClient {
  /** 获取某个类型的图片名称列表 */
  static getImgList(type: string) {
    let url = `${baseUrl}/getimglist?type=${type}`;
    return axiosGetHelper(url);
  }
  static deleteImg(type: string, imgid: any, filename: string) {
    let url = `${baseUrl}/deleteimg?type=${type}&img_id=${imgid}&filename=${filename}`;
    return axiosGetHelper(url);
  }
  static deleteTreeContImg(filename: string) {
    let url = `${baseUrl}/deletetreecontimg?filename=${filename}`;
    return axiosGetHelper(url);
  }
}