function callCampusApi(data) {
  return wx.cloud.callFunction({
    name: "campusApi",
    data,
  });
}

function getPaidStatus(order) {
  if (order.sourceType === "takeaway") {
    return { status: "preparing", statusText: "商家备餐中" };
  }
  if (order.sourceType === "errand") {
    return { status: "waiting", statusText: "等待同学接单" };
  }
  if (order.sourceType === "nearby") {
    return { status: "reserved", statusText: "预约成功" };
  }
  return { status: "preparing", statusText: "制作中" };
}

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

  async loadOrder() {
    const orderId = this.data.orderId;
    if (!orderId) {
      this.setData({ order: null });
      return;
    }

    try {
      const result = await callCampusApi({ action: "getOrder", orderId });
      if (!result.result || !result.result.success || !result.result.data) {
        throw new Error((result.result && result.result.errMsg) || "get order failed");
      }
      const order = result.result.data;
      this.setData({ order: { ...order, id: order._id || order.id, cloudId: order._id || order.cloudId, cloudSynced: true } });
    } catch (err) {
      console.warn("load cloud order failed, use local fallback", err);
      const order = (wx.getStorageSync("mockOrders") || []).find((item) => item.id === orderId || item._id === orderId);
      this.setData({ order: order || null });
    }
  },

  onMethodTap(e) {
    this.setData({ selectedMethod: e.currentTarget.dataset.key });
  },

  updateLocalOrder(id, patch) {
    const orders = (wx.getStorageSync("mockOrders") || []).map((item) => (
      item.id === id || item._id === id ? { ...item, ...patch } : item
    ));
    wx.setStorageSync("mockOrders", orders);
  },

  async onPayTap() {
    const order = this.data.order;
    if (!order || this.data.paying) return;

    this.setData({ paying: true });
    const next = getPaidStatus(order);

    try {
      if (order.cloudSynced) {
        const result = await callCampusApi({
          action: "updateOrderStatus",
          orderId: order.cloudId || order.id,
          status: next.status,
          statusText: next.statusText,
          payMethod: this.data.selectedMethod,
        });
        if (!result.result || !result.result.success) {
          throw new Error((result.result && result.result.errMsg) || "pay order failed");
        }
      } else {
        throw new Error("local order");
      }
    } catch (err) {
      if (order.cloudSynced) {
        console.warn("pay cloud order failed, use local fallback", err);
      }
      this.updateLocalOrder(order.id, {
        ...next,
        paid: true,
        paymentStatus: "paid",
        payMethod: this.data.selectedMethod,
        payTime: Date.now(),
      });
    }

    wx.showToast({ title: "支付成功" });
    setTimeout(() => {
      wx.redirectTo({ url: `/pages/order/detail?id=${order.id}` });
    }, 500);
  },

  onBack() {
    wx.navigateBack();
  },
});
