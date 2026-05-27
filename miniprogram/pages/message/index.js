const STATIC_MESSAGES = [
  {
    id: "m1",
    type: "interaction",
    category: "interaction",
    title: "小橙子赞了你的动态",
    content: "你发布的校园美食探店内容很有用，已经被更多同学看到了。",
    time: "2分钟前",
    icon: "/images/avatar.png",
    badgeIcon: "like",
    unread: true,
  },
  {
    id: "m2",
    type: "interaction",
    category: "interaction",
    title: "周小北评论了你的动态",
    content: "这家奶茶店我也去过，推荐抹茶芋泥。",
    time: "15分钟前",
    icon: "/images/avatar.png",
    badgeIcon: "comment",
    unread: true,
  },
  {
    id: "m5",
    type: "system",
    category: "system",
    title: "校园公告",
    content: "关于秋季学期宿舍电费充值的通知，请同学们及时查看并完成充值。",
    time: "2小时前",
    icon: "/images/default-goods-image.png",
    unread: true,
  },
  {
    id: "m6",
    type: "system",
    category: "system",
    title: "活动提醒",
    content: "迎新嘉年华即将开始，趣味打卡赢好礼。",
    time: "昨天 18:30",
    icon: "/images/default-goods-image.png",
    unread: true,
  },
];

const STATUS_TEXT_MAP = {
  pending_pay: "待付款",
  preparing: "处理中",
  ready: "待取餐",
  delivering: "配送中",
  processing: "进行中",
  reserved: "已预约",
  active: "待参加",
  completed: "已完成",
  refund_pending: "售后中",
  refunded: "已退款",
};

function callCampusApi(data) {
  return wx.cloud.callFunction({
    name: "campusApi",
    data,
  });
}

Page({
  data: {
    activeType: "all",
    summaryCards: [
      { key: "interaction", title: "互动消息", desc: "评论 / 点赞 / @", icon: "chat-o", count: 0, theme: "green" },
      { key: "order", title: "订单消息", desc: "接单 / 配送 / 完成", icon: "orders-o", count: 0, theme: "blue" },
      { key: "system", title: "系统通知", desc: "校园 / 活动 / 服务", icon: "bell", count: 0, theme: "purple" },
    ],
    messages: [],
    allMessages: [],
    cloudReady: false,
    loading: false,
  },

  onShow() {
    this.loadMessages();
  },

  normalizeMessage(item, cloudSynced = false) {
    const type = item.category || item.type || "system";
    const id = item._id || item.id;
    return {
      ...item,
      id,
      cloudId: item._id || item.cloudId,
      type,
      category: type,
      icon: item.icon || "/images/default-goods-image.png",
      time: item.time || this.formatRelativeTime(item.createdAt),
      unread: item.isRead === false || item.unread === true,
      statusText: STATUS_TEXT_MAP[item.status] || item.status,
      cloudSynced,
    };
  },

  getLocalMessages() {
    const orderMessages = (wx.getStorageSync("mockMessages") || []).map((item) => this.normalizeMessage(item, !!item.cloudSynced));
    const readIds = wx.getStorageSync("readMessageIds") || [];
    return orderMessages.concat(STATIC_MESSAGES.map((item) => this.normalizeMessage(item, false))).map((item) => ({
      ...item,
      unread: readIds.includes(item.id) ? false : item.unread,
    }));
  },

  async loadMessages() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    try {
      const result = await callCampusApi({ action: "listMessages", category: this.data.activeType, pageSize: 100 });
      if (!result.result || !result.result.success) {
        throw new Error((result.result && result.result.errMsg) || "list messages failed");
      }
      const cloudMessages = (result.result.data || []).map((item) => this.normalizeMessage(item, true));
      const allMessages = cloudMessages.length ? cloudMessages : this.getLocalMessages();
      this.setData({ allMessages, cloudReady: cloudMessages.length > 0 }, () => this.refreshVisibleMessages());
    } catch (err) {
      console.warn("load cloud messages failed, use local fallback", err);
      this.setData({ allMessages: this.getLocalMessages(), cloudReady: false }, () => this.refreshVisibleMessages());
    } finally {
      this.setData({ loading: false });
    }
  },

  refreshVisibleMessages() {
    const messages = this.data.allMessages;
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
    wx.navigateTo({ url: "/pages/search/index?keyword=消息" });
  },

  onSettingTap() {
    wx.navigateTo({ url: "/pages/message/settings/index" });
  },

  onCardTap(e) {
    const activeType = e.currentTarget.dataset.key;
    this.setData({ activeType }, () => this.loadMessages());
  },

  async onMessageTap(e) {
    const { id, type, orderId } = e.currentTarget.dataset;
    await this.markRead(id);
    if (type === "order" && orderId) {
      wx.navigateTo({ url: `/pages/order/detail?id=${orderId}` });
      return;
    }
    wx.navigateTo({ url: `/pages/message/detail/index?id=${id}` });
  },

  async markRead(id) {
    const target = this.data.allMessages.find((item) => item.id === id);
    if (target && target.cloudSynced) {
      await callCampusApi({ action: "markMessageRead", messageId: target.cloudId || target.id }).catch(() => null);
    }
    const readIds = wx.getStorageSync("readMessageIds") || [];
    if (id && !readIds.includes(id)) wx.setStorageSync("readMessageIds", readIds.concat(id));
    const messages = wx.getStorageSync("mockMessages") || [];
    wx.setStorageSync("mockMessages", messages.map((item) => (
      item.id === id || item._id === id ? { ...item, unread: false, isRead: true } : item
    )));
    const allMessages = this.data.allMessages.map((item) => (
      item.id === id ? { ...item, unread: false, isRead: true } : item
    ));
    this.setData({ allMessages }, () => this.refreshVisibleMessages());
  },

  async onReadAllTap() {
    try {
      await callCampusApi({ action: "markAllMessagesRead", category: this.data.activeType });
    } catch (err) {
      console.warn("mark all cloud messages failed", err);
    }
    const visibleIds = this.data.messages.map((item) => item.id);
    const readIds = Array.from(new Set((wx.getStorageSync("readMessageIds") || []).concat(visibleIds)));
    wx.setStorageSync("readMessageIds", readIds);
    const allMessages = this.data.allMessages.map((item) => (
      this.data.activeType === "all" || item.type === this.data.activeType
        ? { ...item, unread: false, isRead: true }
        : item
    ));
    this.setData({ allMessages }, () => this.refreshVisibleMessages());
    wx.showToast({ title: "已全部已读" });
  },
});
