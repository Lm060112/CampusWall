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
    const activeFilter = this.normalizeFilter(options.filter);
    this.setData({ activeFilter });
  },

  onShow() {
    this.loadOrders();
  },

  normalizeFilter(filter) {
    if (filter === "done" || filter === "comment") return "done";
    if (filter === "doing" || filter === "pay" || filter === "refund") return "doing";
    return "allOrders";
  },

  loadOrders() {
    const orders = (wx.getStorageSync("mockOrders") || []).map((order) => ({
      ...order,
      pickupNo: order.pickupNo || `A${String(order.submittedAt || order.createdAt || Date.now()).slice(-3)}`,
      itemCount: (order.items || []).reduce((sum, item) => sum + item.count, 0),
      previewText: (order.items || []).map((item) => `${item.name}x${item.count}`).join("、"),
      timeText: this.formatTime(order.submittedAt || order.createdAt),
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
      : orders.filter((order) => (
        activeFilter === "done" ? order.status === "已完成" : order.status !== "已完成"
      ));
    this.setData({ visibleOrders });
  },

  onFilterTap(e) {
    this.setData({ activeFilter: e.currentTarget.dataset.key }, () => this.applyFilter());
  },

  onCompleteTap(e) {
    const id = e.currentTarget.dataset.id;
    let updatedOrder = null;
    const orders = this.data.orders.map((order) => (
      order.id === id
        ? (updatedOrder = { ...order, status: "已完成", statusText: "订单已完成" })
        : order
    ));
    wx.setStorageSync("mockOrders", orders);
    if (updatedOrder) {
      this.addOrderMessage(
        updatedOrder,
        "订单已完成",
        `你在 ${updatedOrder.merchant.name} 的订单已完成`,
        "已完成"
      );
    }
    this.setData({ orders }, () => this.applyFilter());
    wx.showToast({ title: "已完成" });
  },

  addOrderMessage(order, title, content, status) {
    const messages = wx.getStorageSync("mockMessages") || [];
    const message = {
      id: `MSG${Date.now()}`,
      type: "order",
      orderId: order.id,
      title,
      content,
      status,
      statusClass: status === "已完成" ? "done" : "processing",
      icon: "/images/default-goods-image.png",
      unread: true,
      createdAt: Date.now(),
    };
    wx.setStorageSync("mockMessages", [message, ...messages]);
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
