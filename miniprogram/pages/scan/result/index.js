Page({
  data: {
    type: "pickup",
    title: "模拟扫码结果",
    code: "A108",
    desc: "这是前端模拟扫码页，可用于展示取餐码、活动核销码或服务码结果。",
  },

  onLoad(options = {}) {
    const type = options.type || "pickup";
    const map = {
      pickup: { title: "取餐码结果", code: "A108", desc: "请到对应服务点出示取餐码。" },
      activity: { title: "活动核销码", code: "ACT-2026", desc: "活动现场可使用该码完成核销。" },
      service: { title: "校园服务码", code: "SVC-001", desc: "用于校园服务窗口识别需求。" },
    };
    this.setData({ type, ...(map[type] || map.pickup) });
  },

  onBack() {
    wx.navigateBack();
  },
});
