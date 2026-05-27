function callCampusApi(data) {
  return wx.cloud.callFunction({
    name: "campusApi",
    data,
  });
}

Page({
  data: {
    orderId: "",
    order: null,
    reasons: ["不想要了", "商家缺货", "配送太久", "信息填写错误", "其他原因"],
    selectedReason: "不想要了",
    desc: "",
    images: [],
  },

  onLoad(options = {}) {
    this.setData({ orderId: options.id || "" });
    this.loadOrder();
  },

  async loadOrder() {
    try {
      const result = await callCampusApi({ action: "getOrder", orderId: this.data.orderId });
      if (!result.result || !result.result.success || !result.result.data) {
        throw new Error((result.result && result.result.errMsg) || "get order failed");
      }
      this.setData({ order: { ...result.result.data, id: result.result.data._id || result.result.data.id, cloudSynced: true } });
    } catch (err) {
      console.warn("load cloud order failed, use local fallback", err);
      const order = (wx.getStorageSync("mockOrders") || []).find((item) => item.id === this.data.orderId || item._id === this.data.orderId);
      this.setData({ order: order || null });
    }
  },

  onReasonTap(e) {
    this.setData({ selectedReason: e.currentTarget.dataset.reason });
  },

  onDescInput(e) {
    this.setData({ desc: e.detail.value || "" });
  },

  onChooseImage() {
    const remain = 3 - this.data.images.length;
    if (remain <= 0) {
      wx.showToast({ title: "最多上传3张凭证", icon: "none" });
      return;
    }
    wx.chooseMedia({
      count: remain,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success: (res) => {
        const picked = (res.tempFiles || []).map((item) => item.tempFilePath);
        this.setData({ images: this.data.images.concat(picked).slice(0, 3) });
      },
    });
  },

  onRemoveImage(e) {
    const index = Number(e.currentTarget.dataset.index);
    this.setData({ images: this.data.images.filter((_, itemIndex) => itemIndex !== index) });
  },

  saveLocalRefund(refund) {
    const orders = (wx.getStorageSync("mockOrders") || []).map((item) => (
      item.id === this.data.orderId || item._id === this.data.orderId
        ? { ...item, status: "refund_pending", statusText: "退款申请已提交", refund }
        : item
    ));
    wx.setStorageSync("mockOrders", orders);
  },

  async onSubmit() {
    if (!this.data.order) return;
    const refund = {
      reason: this.data.selectedReason,
      desc: this.data.desc,
      images: this.data.images,
      createdAt: Date.now(),
      status: "售后中",
    };
    try {
      const result = await callCampusApi({
        action: "requestOrderRefund",
        orderId: this.data.order.id,
        refund,
      });
      if (!result.result || !result.result.success) {
        throw new Error((result.result && result.result.errMsg) || "request refund failed");
      }
      wx.showToast({ title: "已提交" });
    } catch (err) {
      console.warn("request cloud refund failed, use local fallback", err);
      this.saveLocalRefund(refund);
      wx.showToast({ title: "已本地提交", icon: "none" });
    }
    setTimeout(() => wx.navigateBack(), 700);
  },

  onBack() {
    wx.navigateBack();
  },
});
