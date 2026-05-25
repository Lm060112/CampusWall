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

  loadOrder() {
    const orders = wx.getStorageSync("mockOrders") || [];
    const order = orders.find((item) => item.id === this.data.orderId);
    if (!order) {
      this.setData({ order: null });
      return;
    }
    const normalized = {
      ...order,
      displayStatus: this.isDone(order) ? "已完成" : order.status || "进行中",
      pickupNo: order.pickupNo || `A${String(order.submittedAt || order.createdAt || Date.now()).slice(-3)}`,
      itemCount: (order.items || []).reduce((sum, item) => sum + item.count, 0),
      timeText: this.formatTime(order.submittedAt || order.createdAt),
      statusStep: this.getStatusStep(order),
      statusLabels: this.getStatusLabels(order.sourceType),
      primaryAction: this.getPrimaryAction(order),
      done: this.isDone(order),
    };
    this.setData({ order: normalized });
  },

  isDone(order) {
    return order.status === "已完成" || order.statusText === "订单已完成" || !!order.review;
  },

  formatTime(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },

  getStatusStep(order) {
    if (this.isDone(order)) return 3;
    if (["待取餐", "配送中", "进行中", "待参加"].includes(order.status)) return 2;
    return 1;
  },

  getStatusLabels(sourceType) {
    if (sourceType === "takeaway") return ["商家备餐", "配送中", "已送达"];
    if (sourceType === "errand") return ["待接单", "进行中", "已完成"];
    if (sourceType === "nearby") return ["已预约", "待参加", "已完成"];
    return ["制作中", "待取餐", "已完成"];
  },

  getPrimaryAction(order) {
    if (this.isDone(order)) {
      return order.review ? { text: "再来一单", type: "again" } : { text: "去评价", type: "review" };
    }
    if (order.sourceType === "takeaway") {
      return order.status === "配送中"
        ? { text: "确认收货", nextStatus: "已完成", nextText: "订单已完成" }
        : { text: "模拟开始配送", nextStatus: "配送中", nextText: "骑手正在配送中" };
    }
    if (order.sourceType === "errand") {
      return order.status === "进行中"
        ? { text: "确认完成", nextStatus: "已完成", nextText: "跑腿服务已完成" }
        : { text: "模拟已接单", nextStatus: "进行中", nextText: "跑腿同学正在处理" };
    }
    if (order.sourceType === "nearby") {
      return order.status === "待参加"
        ? { text: "确认参加完成", nextStatus: "已完成", nextText: "活动已完成" }
        : { text: "模拟活动开始", nextStatus: "待参加", nextText: "活动即将开始" };
    }
    return order.status === "待取餐"
      ? { text: "确认取餐", nextStatus: "已完成", nextText: "订单已完成" }
      : { text: "模拟备餐完成", nextStatus: "待取餐", nextText: "餐品已备好" };
  },

  updateOrderStatus(status, statusText) {
    const orders = wx.getStorageSync("mockOrders") || [];
    let updatedOrder = null;
    const nextOrders = orders.map((item) => (
      item.id === this.data.orderId
        ? (updatedOrder = { ...item, status, statusText })
        : item
    ));
    wx.setStorageSync("mockOrders", nextOrders);
    if (updatedOrder) {
      this.addOrderMessage(updatedOrder, status === "已完成" ? "订单已完成" : status, this.getStatusMessage(updatedOrder, status), status);
    }
    this.loadOrder();
    wx.showToast({ title: status });
  },

  getStatusMessage(order, status) {
    if (status === "待取餐") return `${order.merchant.name} 已备好，请凭取餐号 ${order.pickupNo} 领取`;
    if (status === "配送中") return `${order.merchant.name} 的外卖正在配送中，请留意取餐点`;
    if (status === "进行中") return `${order.merchant.name} 已被接单，跑腿同学正在处理`;
    if (status === "待参加") return `${order.merchant.name} 即将开始，请按时到达`;
    return `你在 ${order.merchant.name} 的订单已完成`;
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

  onReadyTap() {
    const action = this.data.order.primaryAction;
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

  onAgainTap() {
    wx.navigateTo({ url: "/pages/campus-order/index" });
  },

  onBack() {
    wx.navigateBack();
  },
});
