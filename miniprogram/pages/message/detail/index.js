const STATIC_MESSAGES = [
  {
    id: "m1",
    type: "interaction",
    title: "小橙子赞了你的动态",
    content: "你发布的校园美食探店内容很有用，已经被更多同学看到了。",
    time: "2分钟前",
    icon: "/images/avatar.png",
    actionText: "查看动态",
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
    message: null,
  },

  onLoad(options = {}) {
    this.loadMessage(options.id);
  },

  normalizeMessage(item, cloudSynced = false) {
    const id = item._id || item.id;
    return {
      ...item,
      id,
      cloudId: item._id || item.cloudId,
      type: item.category || item.type || "system",
      icon: item.icon || "/images/default-goods-image.png",
      time: item.time || this.formatRelativeTime(item.createdAt),
      statusText: STATUS_TEXT_MAP[item.status] || item.status,
      actionText: item.actionText || (item.orderId ? "查看订单" : "知道了"),
      targetUrl: item.targetUrl || (item.orderId ? `/pages/order/detail?id=${item.orderId}` : ""),
      cloudSynced,
    };
  },

  getLocalMessages() {
    const orderMessages = (wx.getStorageSync("mockMessages") || []).map((item) => this.normalizeMessage(item, !!item.cloudSynced));
    return orderMessages.concat(STATIC_MESSAGES.map((item) => this.normalizeMessage(item, false)));
  },

  async loadMessage(id) {
    if (!id) return;
    let message = null;

    try {
      const result = await callCampusApi({ action: "getMessage", messageId: id });
      if (!result.result || !result.result.success || !result.result.data) {
        throw new Error((result.result && result.result.errMsg) || "get message failed");
      }
      message = this.normalizeMessage(result.result.data, true);
      await callCampusApi({ action: "markMessageRead", messageId: message.cloudId || message.id }).catch(() => null);
    } catch (err) {
      console.warn("load cloud message failed, use local fallback", err);
      message = this.getLocalMessages().find((item) => item.id === id);
      this.markLocalRead(id);
    }

    if (!message) {
      wx.showToast({ title: "消息不存在", icon: "none" });
      return;
    }
    this.setData({ message: { ...message, unread: false } });
  },

  markLocalRead(id) {
    const readIds = wx.getStorageSync("readMessageIds") || [];
    if (id && !readIds.includes(id)) wx.setStorageSync("readMessageIds", readIds.concat(id));
    const messages = wx.getStorageSync("mockMessages") || [];
    wx.setStorageSync("mockMessages", messages.map((item) => (
      item.id === id || item._id === id ? { ...item, unread: false, isRead: true } : item
    )));
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
