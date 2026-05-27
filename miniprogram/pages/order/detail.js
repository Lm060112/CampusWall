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
  },

  onLoad(options = {}) {
    this.setData({ orderId: options.id || "" });
  },

  onShow() {
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
      this.setData({ order: this.normalizeOrder(result.result.data, true) });
    } catch (err) {
      console.warn("load cloud order failed, use local fallback", err);
      const order = (wx.getStorageSync("mockOrders") || []).find((item) => item.id === orderId || item._id === orderId);
      this.setData({ order: order ? this.normalizeOrder(order, !!order.cloudSynced) : null });
    }
  },

  normalizeOrder(order, cloudSynced = false) {
    const normalized = {
      ...order,
      id: order._id || order.id,
      cloudId: order._id || order.cloudId,
      cloudSynced,
      displayStatus: this.getDisplayStatus(order),
      pickupNo: order.pickupNo || `A${String(order.submittedAt || order.createdAt || Date.now()).slice(-3)}`,
      itemCount: (order.items || []).reduce((sum, item) => sum + Number(item.count || 0), 0),
      timeText: this.formatTime(order.submittedAt || order.createdAt),
      statusStep: this.getStatusStep(order),
      statusLabels: this.getStatusLabels(order.sourceType),
      done: this.isDone(order),
    };
    normalized.primaryAction = this.getPrimaryAction(normalized);
    return normalized;
  },

  isDone(order) {
    return order.status === "completed" || order.statusText === "订单已完成" || !!order.review;
  },

  isPendingPay(order) {
    return !order.paid || order.paymentStatus === "unpaid" || order.status === "pending_pay";
  },

  getDisplayStatus(order) {
    if (this.isDone(order)) return "已完成";
    if (this.isPendingPay(order)) return "待付款";
    return order.statusText || "进行中";
  },

  formatTime(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },

  getStatusStep(order) {
    if (this.isPendingPay(order)) return 0;
    if (this.isDone(order)) return 3;
    if (["ready", "delivering", "processing", "active"].includes(order.status)) return 2;
    return 1;
  },

  getStatusLabels(sourceType) {
    if (sourceType === "takeaway") return ["商家备餐", "配送中", "已送达"];
    if (sourceType === "errand") return ["等待接单", "进行中", "已完成"];
    if (sourceType === "nearby") return ["已预约", "待参加", "已完成"];
    return ["制作中", "待取餐", "已完成"];
  },

  getPrimaryAction(order) {
    if (this.isPendingPay(order)) return { text: "去支付", type: "pay" };
    if (this.isDone(order)) {
      return order.review ? { text: "再来一单", type: "again" } : { text: "去评价", type: "review" };
    }
    if (order.sourceType === "takeaway") {
      return order.status === "delivering"
        ? { text: "确认收货", nextStatus: "completed", nextText: "订单已完成" }
        : { text: "模拟开始配送", nextStatus: "delivering", nextText: "骑手正在配送中" };
    }
    if (order.sourceType === "errand") {
      return order.status === "processing"
        ? { text: "确认完成", nextStatus: "completed", nextText: "跑腿服务已完成" }
        : { text: "模拟已接单", nextStatus: "processing", nextText: "跑腿同学正在处理" };
    }
    if (order.sourceType === "nearby") {
      return order.status === "active"
        ? { text: "确认参加完成", nextStatus: "completed", nextText: "活动已完成" }
        : { text: "模拟活动开始", nextStatus: "active", nextText: "活动即将开始" };
    }
    return order.status === "ready"
      ? { text: "确认取餐", nextStatus: "completed", nextText: "订单已完成" }
      : { text: "模拟备餐完成", nextStatus: "ready", nextText: "餐品已备好" };
  },

  updateLocalOrder(id, patch) {
    const orders = (wx.getStorageSync("mockOrders") || []).map((item) => (
      item.id === id || item._id === id ? { ...item, ...patch } : item
    ));
    wx.setStorageSync("mockOrders", orders);
  },

  async updateOrderStatus(status, statusText) {
    const order = this.data.order;
    if (!order) return;
    const patch = { status, statusText, paid: status !== "pending_pay", paymentStatus: status === "refunded" ? "refunded" : "paid" };

    if (order.cloudSynced) {
      try {
        const result = await callCampusApi({
          action: "updateOrderStatus",
          orderId: order.cloudId || order.id,
          status,
          statusText,
        });
        if (!result.result || !result.result.success) {
          throw new Error((result.result && result.result.errMsg) || "update order failed");
        }
        this.loadOrder();
        wx.showToast({ title: statusText || "已更新" });
        return;
      } catch (err) {
        console.warn("update cloud order failed, use local fallback", err);
      }
    }

    this.updateLocalOrder(order.id, patch);
    this.loadOrder();
    wx.showToast({ title: statusText || "已更新" });
  },

  onReadyTap() {
    const action = this.data.order && this.data.order.primaryAction;
    if (!action) return;
    if (action.type === "pay") {
      this.onPayTap();
      return;
    }
    if (action.type === "review") {
      wx.navigateTo({ url: `/pages/order/review/index?id=${this.data.order.id}` });
      return;
    }
    if (action.type === "again") {
      this.onAgainTap();
      return;
    }
    this.updateOrderStatus(action.nextStatus, action.nextText);
  },

  onPayTap() {
    wx.navigateTo({ url: `/pages/order/pay/index?id=${this.data.order.id}` });
  },

  onRefundTap() {
    wx.navigateTo({ url: `/pages/order/refund/index?id=${this.data.order.id}` });
  },

  onAgainTap() {
    const source = this.data.order.sourceType;
    const routes = {
      campus: "/pages/campus-order/index",
      takeaway: "/pages/takeaway/index",
      errand: "/pages/errand/index",
      nearby: "/pages/nearby/index",
    };
    wx.navigateTo({ url: routes[source] || "/pages/campus-order/index" });
  },

  onBack() {
    wx.navigateBack();
  },
});
