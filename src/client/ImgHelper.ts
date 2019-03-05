// 后台启动的服务地址
import { baseUrl } from '@/config';
import { axiosGetHelper, axiosPostHelper } from './clientHelper';

/** 操作图片 */
export namespace ImgHelper {
  /** 获取某个类型的图片名称列表 */
  export async function getImgList(type: string): Promise<any[]> {
    const data = await axiosGetHelper(`${baseUrl}/getimglist?type=${type}`);
    return data && data.resultsCode === 'success' ? data.data : [];
  }

  export async function deleteImg(params: any): Promise<boolean> {
    const data = await axiosPostHelper(`${baseUrl}/deleteimg`, params);
    return data && data.resultsCode === 'success' ? true : false;
  }
  
  export async function deleteTreeContImg(params: any): Promise<boolean> {
    const data = await axiosPostHelper(`${baseUrl}/deletetreecontimg`, params);
    return data && data.resultsCode === 'success' ? true : false;
  }
}