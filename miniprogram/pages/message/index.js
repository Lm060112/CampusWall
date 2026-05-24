const STATIC_MESSAGES = [
  {
    id: "m1",
    type: "interaction",
    title: "小橙子赞了你的动态",
    content: "你发布的校园美食探店vlog真的好棒～",
    time: "2分钟前",
    icon: "/images/avatar.png",
    badgeIcon: "like",
    unread: true,
  },
  {
    id: "m2",
    type: "interaction",
    title: "周小北评论了你的动态",
    content: "这家奶茶店我也去过！推荐抹茶芋泥～",
    time: "15分钟前",
    icon: "/images/icons/avatar.png",
    badgeIcon: "comment",
    unread: true,
  },
  {
    id: "m5",
    type: "system",
    title: "校园公告",
    content: "关于2024年秋季学期宿舍电费充值的通知",
    time: "2小时前",
    icon: "/images/default-goods-image.png",
    unread: true,
  },
  {
    id: "m6",
    type: "system",
    title: "活动提醒",
    content: "迎新嘉年华｜趣味打卡赢好礼！",
    time: "昨天 18:30",
    icon: "/images/default-goods-image.png",
    unread: true,
  },
];

Page({
  data: {
    activeType: "all",
    summaryCards: [
      {
        key: "interaction",
        title: "互动消息",
        desc: "评论 / 点赞 / @",
        icon: "chat-o",
        count: 0,
        theme: "green",
      },
      {
        key: "order",
        title: "订单消息",
        desc: "提交 / 取餐 / 完成",
        icon: "orders-o",
        count: 0,
        theme: "blue",
      },
      {
        key: "system",
        title: "系统通知",
        desc: "校园 / 活动 / 服务",
        icon: "bell",
        count: 0,
        theme: "purple",
      },
    ],
    messages: [],
  },

  onShow() {
    this.loadMessages();
  },

  loadMessages() {
    const orderMessages = (wx.getStorageSync("mockMessages") || []).map((item) => ({
      ...item,
      time: this.formatRelativeTime(item.createdAt),
    }));
    const messages = [...orderMessages, ...STATIC_MESSAGES];
    const unreadCountByType = messages.reduce((acc, item) => {
      if (item.unread) acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
    const summaryCards = this.data.summaryCards.map((item) => ({
      ...item,
      count: unreadCountByType[item.key] || 0,
    }));
    const visibleMessages = this.data.activeType === "all"
      ? messages
      : messages.filter((item) => item.type === this.data.activeType);
    this.setData({ summaryCards, messages: visibleMessages });
  },

  formatRelativeTime(ts) {
    if (!ts) return "";
    const diff = Date.now() - ts;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    if (diff < minute) return "刚刚";
    if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
    if (diff < 24 * hour) return `${Math.floor(diff / hour)}小时前`;
    const d = new Date(ts);
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  },

  onSearchTap() {
    wx.showToast({ title: "消息搜索待接入", icon: "none" });
  },

  onSettingTap() {
    wx.showToast({ title: "消息设置待接入", icon: "none" });
  },

  onCardTap(e) {
    const activeType = e.currentTarget.dataset.key;
    this.setData({ activeType }, () => this.loadMessages());
  },

  onMessageTap(e) {
    const { id, type, orderId } = e.currentTarget.dataset;
    if (type === "order" && orderId) {
      this.markRead(id);
      wx.navigateTo({ url: `/pages/order/detail?id=${orderId}` });
      return;
    }
    this.markRead(id);
    wx.showToast({ title: "消息已读", icon: "none" });
  },

  markRead(id) {
    const messages = wx.getStorageSync("mockMessages") || [];
    const nextMessages = messages.map((item) => (
      item.id === id ? { ...item, unread: false } : item
    ));
    wx.setStorageSync("mockMessages", nextMessages);
    this.loadMessages();
  },
});
