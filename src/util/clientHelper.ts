// 后台启动的服务地址
import { baseUrl } from '@/config';
import axios from 'axios';

const axiosGetHelper = async (url: string) => {
  let res: any;
  try {
    res = await axios.get(url);
  } catch (e) {
    console.log("get请求失败", e);
    return;
  }
  // 拦截下请求失败的情况
  if (res['data']['resultsCode'] === 'error') {
    console.log(res.data.message);
    return;
  }
  return res.data;
};

const axiosPostHelper = async (url: string, params: any) => {
  let res: any;
  try {
    res = await axios.post(url, params);
  } catch (e) {
    console.log("post请求失败");
    return;
  }
  // 拦截下请求失败的情况
  if (res['data']['resultsCode'] === 'error') {
    console.log(res.data.message);
    return;
  }
  return res.data;
};

/** 用户 */
export namespace UserClient {
  export function postLogin(username: any, userpword: any) {
    let url = `${baseUrl}/login`;
    let params = {
      username,
      userpword
    };
    return axiosPostHelper(url, params);
  }
}

/** 操作树 */
export namespace TreeClient {
  export function getTree(type: string) {
    let url = `${baseUrl}/tree?type=${type}`;
    return axiosGetHelper(url);
  }
  export function getChildName(id: string) {
    let url = `${baseUrl}/getchildname?id=${id}`;
    return axiosGetHelper(url);
  }
  export function addTreeNode(level: any, params: any) {
    let url: string = '';
    if (level === 3) {
      url = `${baseUrl}/addtreenode?level=${level}&id=${params.id}&label=${params.label}&f_sort=${params.f_sort}&category_id=${params.category_id}&c_sort=${params.c_sort}`;
    }
    if (level === 2) {
      url = `${baseUrl}/addtreenode?level=${level}&category_id=${params.category_id}&sort=${params.sort}`;
    }
    if (level === 1) {
      url = `${baseUrl}/addtreenode?level=${level}&sort=${params.sort}`;
    }
    return axiosGetHelper(url);
  }
  export function modifyTreeNode(id: any, label: any, level: any) {
    let url = `${baseUrl}/modifytreenode?id=${id}&label=${label}&level=${level}`;
    return axiosGetHelper(url);
  }
  export function deleteTreeNode(id: string, level: any) {
    let url = `${baseUrl}/deletetreenode?id=${id}&level=${level}`;
    return axiosGetHelper(url);
  }
  export function changeSort(level: any, thisId: any, thisSort: any, otherId: any, otherSort: any) {
    let url = `${baseUrl}/changesort?level=${level}&thisId=${thisId}&thisSort=${thisSort}&otherId=${otherId}&otherSort=${otherSort}`;
    return axiosGetHelper(url);
  }
  export function changeFather(shuttleLevel: any, params: any) {
    let url: string = '';
    if (shuttleLevel === 2) {
      url = `${baseUrl}/changefather?shuttleLevel=${shuttleLevel}&category_id=${params.category_id}&f_sort=${params.f_sort}&f_id=${params.f_id}`;
    }     
    if (shuttleLevel === 3) {
      url = `${baseUrl}/changefather?shuttleLevel=${shuttleLevel}&fatherid=${params.fatherid}&fatherlabel=${params.fatherlabel}&fathersort=${params.fathersort}&newchildsort=${params.newchildsort}&childid=${params.childid}`;
    }
    return axiosGetHelper(url);
  }
}

export namespace ContClient {
  /** 操作子节点内容 */
  export function getNodeCont(id: any) {
    let url = `${baseUrl}/cont?id=${id}`;
    return axiosGetHelper(url);
  }
  export function getAllCont() {
    let url = `${baseUrl}/allcont`;
    return axiosGetHelper(url);
  }
  export function getAlmostCont() {
    let url = `${baseUrl}/almostcont`;
    return axiosGetHelper(url);
  }
  export function addNodeCont(id: string, sort: any) {
    let url = `${baseUrl}/addnodecont`;
    let params = {
      id,
      sort
    };
    return axiosPostHelper(url, params);
  }
  export function modifyNodeCont(obj: any) {
    let params = obj;
    return axiosPostHelper(`${baseUrl}/modifynodecont`, params);
  }
  export function deleteNodeCont(id: string, sort: any) {
    let url = `${baseUrl}/deletenodecont?id=${id}&sort=${sort}`;
    return axiosGetHelper(url);
  }
  export function changeContSort(thiscTime: string, thisSort: any, othercTime: string, otherSort: any) {
    let url = `${baseUrl}/changecontsort?thiscTime=${thiscTime}&thisSort=${thisSort}&othercTime=${othercTime}&otherSort=${otherSort}`;
    return axiosGetHelper(url);
  }
}

export namespace ImgClient {
  /** 获取某个类型的图片名称列表 */
  export function getImgList(type: string) {
    let url = `${baseUrl}/getimglist?type=${type}`;
    return axiosGetHelper(url);
  }
  export function deleteImg(type: string, imgid: any, filename: string) {
    let url = `${baseUrl}/deleteimg?type=${type}&img_id=${imgid}&filename=${filename}`;
    return axiosGetHelper(url);
  }
  export function deleteTreeContImg(filename: string) {
    let url = `${baseUrl}/deletetreecontimg?filename=${filename}`;
    return axiosGetHelper(url);
  }
}