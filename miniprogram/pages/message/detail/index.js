const STATIC_MESSAGES = [
  {
    id: "m1",
    type: "interaction",
    title: "小橙子赞了你的动态",
    content: "你发布的校园美食探店内容很有用，已经被更多同学看到了。",
    time: "2分钟前",
    icon: "/images/avatar.png",
    actionText: "去查看动态",
    targetUrl: "/pages/discover/index",
  },
  {
    id: "m2",
    type: "interaction",
    title: "周小北评论了你的动态",
    content: "这家奶茶店我也去过，推荐抹茶芋泥。",
    time: "15分钟前",
    icon: "/images/avatar.png",
    actionText: "回复评论",
    targetUrl: "/pages/discover/index",
  },
  {
    id: "m5",
    type: "system",
    title: "校园公告",
    content: "关于秋季学期宿舍电费充值的通知，请同学们及时查看并完成充值。",
    time: "2小时前",
    icon: "/images/default-goods-image.png",
    actionText: "知道了",
  },
  {
    id: "m6",
    type: "system",
    title: "活动提醒",
    content: "迎新嘉年华即将开始，趣味打卡赢好礼。活动地点为崇明校区中心广场。",
    time: "昨天 18:30",
    icon: "/images/default-goods-image.png",
    actionText: "查看活动",
    targetUrl: "/pages/discover/index",
  },
];

Page({
  data: {
    message: null,
  },

  onLoad(options = {}) {
    this.markRead(options.id);
    this.loadMessage(options.id);
  },

  getAllMessages() {
    const orderMessages = (wx.getStorageSync("mockMessages") || []).map((item) => ({
      ...item,
      icon: item.icon || "/images/default-goods-image.png",
      actionText: item.orderId ? "查看订单" : "知道了",
      targetUrl: item.orderId ? `/pages/order/detail?id=${item.orderId}` : "",
    }));
    return orderMessages.concat(STATIC_MESSAGES);
  },

  markRead(id) {
    const readIds = wx.getStorageSync("readMessageIds") || [];
    if (id && !readIds.includes(id)) wx.setStorageSync("readMessageIds", readIds.concat(id));
    const messages = wx.getStorageSync("mockMessages") || [];
    wx.setStorageSync("mockMessages", messages.map((item) => (
      item.id === id ? { ...item, unread: false } : item
    )));
  },

  loadMessage(id) {
    const message = this.getAllMessages().find((item) => item.id === id);
    if (!message) {
      wx.showToast({ title: "消息不存在", icon: "none" });
      return;
    }
    this.setData({ message: { ...message, unread: false } });
  },

  onBack() {
    wx.navigateBack();
  },

  onActionTap() {
    const message = this.data.message;
    if (!message || !message.targetUrl) {
      wx.navigateBack();
      return;
    }
    if (message.targetUrl.includes("/pages/discover/index")) {
      wx.switchTab({ url: "/pages/discover/index" });
      return;
    }
    wx.navigateTo({ url: message.targetUrl });
  },
});
