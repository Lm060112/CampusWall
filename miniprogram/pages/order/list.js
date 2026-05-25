const FILTERS = [
  { key: "allOrders", title: "全部" },
  { key: "doing", title: "进行中" },
  { key: "done", title: "已完成" },
];

Page({
  data: {
    filters: FILTERS,
    activeFilter: "allOrders",
    orders: [],
    visibleOrders: [],
  },

  onLoad(options = {}) {
    this.setData({ activeFilter: this.normalizeFilter(options.filter) });
  },

  onShow() {
    this.loadOrders();
  },

  normalizeFilter(filter) {
    if (filter === "done" || filter === "comment") return "done";
    if (filter === "doing" || filter === "pay" || filter === "refund") return "doing";
    return "allOrders";
  },

  isDone(order) {
    return order.status === "已完成" || order.statusText === "订单已完成" || !!order.review;
  },

  loadOrders() {
    const orders = (wx.getStorageSync("mockOrders") || []).map((order) => ({
      ...order,
      displayStatus: this.isDone(order) ? "已完成" : order.status || "进行中",
      pickupNo: order.pickupNo || `A${String(order.submittedAt || order.createdAt || Date.now()).slice(-3)}`,
      itemCount: (order.items || []).reduce((sum, item) => sum + item.count, 0),
      previewText: (order.items || []).map((item) => `${item.name}x${item.count}`).join("、"),
      timeText: this.formatTime(order.submittedAt || order.createdAt),
      done: this.isDone(order),
    }));
    this.setData({ orders }, () => this.applyFilter());
  },

  formatTime(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },

  applyFilter() {
    const { activeFilter, orders } = this.data;
    const visibleOrders = activeFilter === "allOrders"
      ? orders
      : orders.filter((order) => (activeFilter === "done" ? order.done : !order.done));
    this.setData({ visibleOrders });
  },

  onFilterTap(e) {
    this.setData({ activeFilter: e.currentTarget.dataset.key }, () => this.applyFilter());
  },

  updateOrder(id, patch) {
    const orders = (wx.getStorageSync("mockOrders") || []).map((order) => (
      order.id === id ? { ...order, ...patch } : order
    ));
    wx.setStorageSync("mockOrders", orders);
    this.loadOrders();
  },

  onCompleteTap(e) {
    const id = e.currentTarget.dataset.id;
    this.updateOrder(id, { status: "已完成", statusText: "订单已完成" });
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
      title: "清空模拟订单",
      content: "仅清空本机模拟数据，不影响后续正式数据库。",
      success: (res) => {
        if (!res.confirm) return;
        wx.removeStorageSync("mockOrders");
        this.setData({ orders: [], visibleOrders: [] });
      },
    });
  },

  onBack() {
    wx.navigateBack();
  },
});
