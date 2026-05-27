const FILTERS = [
  { key: "allOrders", title: "全部" },
  { key: "pay", title: "待付款" },
  { key: "doing", title: "进行中" },
  { key: "comment", title: "待评价" },
  { key: "refund", title: "售后" },
  { key: "done", title: "已完成" },
];

function callCampusApi(data) {
  return wx.cloud.callFunction({
    name: "campusApi",
    data,
  });
}

Page({
  data: {
    filters: FILTERS,
    activeFilter: "allOrders",
    orders: [],
    visibleOrders: [],
    emptyText: "暂无订单",
    cloudReady: false,
  },

  onLoad(options = {}) {
    this.setData({ activeFilter: options.filter || "allOrders" });
  },

  onShow() {
    this.loadOrders();
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

  async loadOrders() {
    try {
      const result = await callCampusApi({ action: "listOrders", pageSize: 100 });
      if (!result.result || !result.result.success) {
        throw new Error((result.result && result.result.errMsg) || "list orders failed");
      }
      const list = (result.result.data && result.result.data.list) || [];
      this.setData({
        orders: list.map((order) => this.normalizeOrder(order, true)),
        cloudReady: true,
      }, () => this.applyFilter());
    } catch (err) {
      console.warn("load cloud orders failed, use local fallback", err);
      const orders = (wx.getStorageSync("mockOrders") || []).map((order) => this.normalizeOrder(order, !!order.cloudSynced));
      this.setData({ orders, cloudReady: false }, () => this.applyFilter());
    }
  },

  normalizeOrder(order, cloudSynced = false) {
    const normalized = {
      ...order,
      id: order._id || order.id,
      cloudId: order._id || order.cloudId,
      cloudSynced,
      pickupNo: order.pickupNo || `A${String(order.submittedAt || order.createdAt || Date.now()).slice(-3)}`,
      itemCount: (order.items || []).reduce((sum, item) => sum + Number(item.count || 0), 0),
      previewText: (order.items || []).map((item) => `${item.name}x${item.count}`).join("、"),
      timeText: this.formatTime(order.submittedAt || order.createdAt),
    };
    normalized.done = this.isDone(normalized);
    normalized.displayStatus = this.getDisplayStatus(normalized);
    return normalized;
  },

  formatTime(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },

  applyFilter() {
    const { activeFilter, orders } = this.data;
    const visibleOrders = orders.filter((order) => {
      if (activeFilter === "allOrders") return true;
      if (activeFilter === "pay") return this.isPendingPay(order) && !order.done;
      if (activeFilter === "doing") return !this.isPendingPay(order) && !order.done && order.status !== "refund_pending";
      if (activeFilter === "comment") return order.done && !order.review;
      if (activeFilter === "refund") return order.status === "refund_pending" || order.status === "refunded" || !!order.refund;
      if (activeFilter === "done") return order.done;
      return true;
    });
    const active = FILTERS.find((item) => item.key === activeFilter);
    this.setData({
      visibleOrders,
      emptyText: active ? `${active.title}暂无订单` : "暂无订单",
    });
  },

  onFilterTap(e) {
    this.setData({ activeFilter: e.currentTarget.dataset.key }, () => this.applyFilter());
  },

  updateLocalOrder(id, patch) {
    const orders = (wx.getStorageSync("mockOrders") || []).map((order) => (
      order.id === id || order._id === id ? { ...order, ...patch } : order
    ));
    wx.setStorageSync("mockOrders", orders);
  },

  async updateOrder(id, patch) {
    const target = this.data.orders.find((order) => order.id === id);
    if (!target) return;

    if (target.cloudSynced) {
      try {
        const result = await callCampusApi({
          action: "updateOrderStatus",
          orderId: target.cloudId || target.id,
          status: patch.status,
          statusText: patch.statusText,
        });
        if (!result.result || !result.result.success) {
          throw new Error((result.result && result.result.errMsg) || "update order failed");
        }
        this.loadOrders();
        return;
      } catch (err) {
        console.warn("update cloud order failed, use local fallback", err);
      }
    }

    this.updateLocalOrder(id, patch);
    this.loadOrders();
  },

  onPayTap(e) {
    wx.navigateTo({ url: `/pages/order/pay/index?id=${e.currentTarget.dataset.id}` });
  },

  async onCompleteTap(e) {
    const id = e.currentTarget.dataset.id;
    await this.updateOrder(id, { status: "completed", statusText: "订单已完成", paid: true, paymentStatus: "paid" });
    wx.showToast({ title: "已完成" });
  },

  onReviewTap(e) {
    wx.navigateTo({ url: `/pages/order/review/index?id=${e.currentTarget.dataset.id}` });
  },

  onOrderTap(e) {
    wx.navigateTo({ url: `/pages/order/detail?id=${e.currentTarget.dataset.id}` });
  },

  onClearTap() {
    wx.showModal({
      title: "清空本地订单",
      content: this.data.cloudReady ? "当前订单来自云端，本按钮只清空本地缓存，不会删除云数据库订单。" : "仅清空本机模拟订单，不影响云数据库。",
      success: (res) => {
        if (!res.confirm) return;
        wx.removeStorageSync("mockOrders");
        this.loadOrders();
      },
    });
  },

  onBack() {
    wx.navigateBack();
  },
});
