Page({
  data: {
    orderId: "",
    order: null,
    methods: [
      { key: "wechat", title: "微信支付", desc: "正式上线后接入微信支付" },
      { key: "campus", title: "校园卡", desc: "预留校园卡支付方式" },
      { key: "mock", title: "模拟支付", desc: "当前前端演示可用" },
    ],
    selectedMethod: "mock",
    paying: false,
  },

  onLoad(options = {}) {
    this.setData({ orderId: options.id || "" });
    this.loadOrder();
  },

  loadOrder() {
    const order = (wx.getStorageSync("mockOrders") || []).find((item) => item.id === this.data.orderId);
    this.setData({ order: order || null });
  },

  onMethodTap(e) {
    this.setData({ selectedMethod: e.currentTarget.dataset.key });
  },

  onPayTap() {
    if (!this.data.order || this.data.paying) return;
    this.setData({ paying: true });
    setTimeout(() => {
      const orders = (wx.getStorageSync("mockOrders") || []).map((item) => (
        item.id === this.data.orderId ? { ...item, paid: true, payMethod: this.data.selectedMethod, payTime: Date.now() } : item
      ));
      wx.setStorageSync("mockOrders", orders);
      wx.showToast({ title: "支付成功" });
      setTimeout(() => wx.redirectTo({ url: `/pages/order/detail?id=${this.data.orderId}` }), 600);
    }, 500);
  },

  onBack() {
    wx.navigateBack();
  },
});
