//获取应用实例
const app = getApp();
Page({
    data: {
        src: '',
        width: 300, //宽度
        height: 250, //高度
        type: '' //哪个页面使用的
    },
    onLoad: function (options) {
        this.cropper = this.selectComponent("#image-cropper");
        this.setData({
            src: options.imgSrc,
            type: options.type
        });
        if(!options.imgSrc){
            this.cropper.upload(); //上传图片
        }
    },
    loadimage(e) {
        wx.hideLoading();
        this.cropper.imgReset();
    },
    clickcut(e) {
        //图片预览
        wx.previewImage({
            current: e.detail.url, // 当前显示图片的http链接
            urls: [e.detail.url] // 需要预览的图片http链接列表
        })
    },
    upload() {
        let that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success(res) {
                wx.showLoading({
                    title: '加载中',
                })
                const tempFilePaths = res.tempFilePaths[0];
                //重置图片角度、缩放、位置
                that.cropper.imgReset();
                that.setData({
                    src: tempFilePaths
                });
            }
        })
    },
    //
    imgsubmit() {
        this.cropper.getImg((obj) => {
            switch(this.data.type) {
                case 'publish':
                    app.globalData.imgSrc = obj.url;
                    break;
                case 'edit':
                    app.globalData.avatar = obj.url;
                    break;
                default:
                    break;
            } 
            wx.navigateBack({
                delta: -1
            })
        });
    },
    //返回上一层
    imgcancle() {
        wx.navigateBack({
            delta: -1
        })
    },
    rotate() {
        //在用户旋转的基础上旋转90°
        this.cropper.setAngle(this.cropper.data.angle += 90);
    },
    end(e) {
        clearInterval(this.data[e.currentTarget.dataset.type]);
    },
})