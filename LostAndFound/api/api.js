const baseUrl = "http://localhost:5000";
//处理请求头 header
function createHeader(url,method) {
  let header = {};
  method == 'post' ? header['content-type'] = 'application/x-www-form-urlencoded' : header['content-type'] = 'application/json'
  let loginUrl = "/api/login";
  if(url != loginUrl) {
    let token = JSON.parse(wx.getStorageSync("laf")).token;
    header['access-token'] = token;
  }
  return header;
}

const api = {
  post(url,params) {
    let header = createHeader(url,'post');
    return new Promise((resolve,reject) => {
      wx.request({
        url: baseUrl + url,
        data: params,
        header: header,
        method: 'POST',
        dataType: 'json',
        responseType: 'text',
        success: (result)=>{
          result.statusCode === 200 ? resolve(result) : reject(result)
        },
        fail: (res)=>{
          reject(res)
        },
        complete: ()=>{}
      });
    })
  },
  get(url,params) {
    return new Promise((resolve,reject) => {
      let header = createHeader(url,'get');
      wx.request({
        url: baseUrl + url,
        data: params,
        header: header,
        dataType: 'json',
        responseType: 'text',
        success: (result)=>{
          result.statusCode === 200 ? resolve(result) : reject(result)
        },
        fail: (res)=>{
          reject(res)
        },
        complete: ()=>{}
      })
    })
  }
}

export default api;