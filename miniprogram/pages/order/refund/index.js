Page({
  data: {
    orderId: "",
    order: null,
    reasons: ["不想要了", "商家缺货", "配送太久", "信息填写错误", "其他原因"],
    selectedReason: "不想要了",
    desc: "",
  },

  onLoad(options = {}) {
    this.setData({ orderId: options.id || "" });
    this.loadOrder();
  },

  loadOrder() {
    const order = (wx.getStorageSync("mockOrders") || []).find((item) => item.id === this.data.orderId);
    this.setData({ order: order || null });
  },

  onReasonTap(e) {
    this.setData({ selectedReason: e.currentTarget.dataset.reason });
  },

  onDescInput(e) {
    this.setData({ desc: e.detail.value || "" });
  },

  onSubmit() {
    if (!this.data.order) return;
    const refund = {
      reason: this.data.selectedReason,
      desc: this.data.desc,
      createdAt: Date.now(),
      status: "售后中",
    };
    const orders = (wx.getStorageSync("mockOrders") || []).map((item) => (
      item.id === this.data.orderId ? { ...item, status: "售后中", statusText: "退款申请已提交", refund } : item
    ));
    wx.setStorageSync("mockOrders", orders);
    wx.showToast({ title: "已提交" });
    setTimeout(() => wx.navigateBack(), 700);
  },

  onBack() {
    wx.navigateBack();
  },
});
