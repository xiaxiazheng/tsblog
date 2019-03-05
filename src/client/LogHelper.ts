// 后台启动的服务地址
import { baseUrl } from '@/config';
import { axiosGetHelper, axiosPostHelper } from './clientHelper';

/** 操作日志 */
export namespace LogHelper {
  export async function getLogListByCTime(params: any): Promise<any> {
    const data = await axiosPostHelper(`${baseUrl}/loglistbyctime`, params);
    return data && data.resultsCode === 'success' ? data.data : false;
  }

  export async function getLogListByMTime(params: any): Promise<any> {
    const data = await axiosPostHelper(`${baseUrl}/loglistbyctime`, params);
    return data && data.resultsCode === 'success' ? data.data : false;
  }

  export async function getLogCont(id: string): Promise<any> {
    const data = await axiosGetHelper(`${baseUrl}/logcont?id=${id}`);
    return data && data.resultsCode === 'success' ? data.data : false;
  }

  export async function addLogCont(): Promise<boolean> {
    const data = await axiosPostHelper(`${baseUrl}/addlogcont`);
    return data && data.resultsCode === 'success' ? true : false;
  }

  export async function modifyLogCont(params: any): Promise<boolean> {
    const data = await axiosPostHelper(`${baseUrl}/modifylogcont`, params);
    return data && data.resultsCode === 'success' ? true : false;
  }

  export async function deleteLogCont(params: any): Promise<boolean> {
    const data = await axiosPostHelper(`${baseUrl}/deletelogcont`, params);
    return data && data.resultsCode === 'success' ? true : false;
  }
}