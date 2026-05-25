const CONTENT = {
  about: {
    title: "关于小程序",
    paragraphs: [
      "校园生活小程序当前为前端模拟版本，主要用于演示校园点单、外卖、跑腿、活动、校园墙、消息和订单流程。",
      "后续接入真实数据时，需要补充云数据库、权限、支付、内容审核和运营管理后台。",
    ],
  },
  privacy: {
    title: "隐私政策",
    paragraphs: [
      "当前版本的数据主要保存在本机缓存中，用于前端流程演示。",
      "正式上线前，需要明确收集的用户信息、用途、保存周期、删除方式和第三方共享情况。",
    ],
  },
  terms: {
    title: "用户协议",
    paragraphs: [
      "用户应遵守校园平台使用规范，不发布违法、虚假、侵权或影响校园秩序的信息。",
      "涉及交易、跑腿、活动报名等服务时，正式版本需要补充责任边界、退款规则和纠纷处理机制。",
    ],
  },
};

Page({
  data: {
    doc: CONTENT.about,
  },

  onLoad(options = {}) {
    this.setData({ doc: CONTENT[options.type] || CONTENT.about });
  },

  onBack() {
    wx.navigateBack();
  },
});
