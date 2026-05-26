const FILTERS = [
  { key: "allOrders", title: "全部" },
  { key: "pay", title: "待付款" },
  { key: "doing", title: "进行中" },
  { key: "comment", title: "待评价" },
  { key: "refund", title: "售后" },
  { key: "done", title: "已完成" },
];

Page({
  data: {
    filters: FILTERS,
    activeFilter: "allOrders",
    orders: [],
    visibleOrders: [],
    emptyText: "暂无订单",
  },

  onLoad(options = {}) {
    this.setData({ activeFilter: options.filter || "allOrders" });
  },

  onShow() {
    this.loadOrders();
  },

  isDone(order) {
    return order.status === "已完成" || order.statusText === "订单已完成" || !!order.review;
  },

  loadOrders() {
    const orders = (wx.getStorageSync("mockOrders") || []).map((order) => ({
      ...order,
      displayStatus: this.isDone(order) ? "已完成" : order.status || (order.paid ? "进行中" : "待付款"),
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
    const visibleOrders = orders.filter((order) => {
      if (activeFilter === "allOrders") return true;
      if (activeFilter === "pay") return !order.paid && !order.done;
      if (activeFilter === "doing") return order.paid && !order.done && order.status !== "售后中";
      if (activeFilter === "comment") return order.done && !order.review;
      if (activeFilter === "refund") return order.status === "售后中" || !!order.refund;
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

  updateOrder(id, patch) {
    const orders = (wx.getStorageSync("mockOrders") || []).map((order) => (
      order.id === id ? { ...order, ...patch } : order
    ));
    wx.setStorageSync("mockOrders", orders);
    this.loadOrders();
  },

  onPayTap(e) {
    wx.navigateTo({ url: `/pages/order/pay/index?id=${e.currentTarget.dataset.id}` });
  },

  onCompleteTap(e) {
    const id = e.currentTarget.dataset.id;
    this.updateOrder(id, { status: "已完成", statusText: "订单已完成", paid: true });
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
