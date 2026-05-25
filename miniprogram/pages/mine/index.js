const app = getApp();
const DISCOVER_STORAGE_KEY = "campus_discover_posts";

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    stats: [],
    orderItems: [
      { key: "pay", title: "待付款", icon: "balance-pay" },
      { key: "doing", title: "进行中", icon: "todo-list-o" },
      { key: "comment", title: "待评价", icon: "comment-o" },
      { key: "refund", title: "退款/售后", icon: "cash-back-record" },
      { key: "done", title: "已完成", icon: "passed" },
    ],
    publishItems: [
      { key: "published", title: "我发布的", icon: "guide-o", color: "#35c46a" },
      { key: "favorites", title: "我收藏的", icon: "star-o", color: "#ffc529" },
      { key: "sold", title: "我卖出的", icon: "notes-o", color: "#ff7a45" },
      { key: "history", title: "浏览记录", icon: "bar-chart-o", color: "#8b62f2" },
    ],
    menuItems: [
      { key: "favorites", title: "我的收藏", icon: "star", color: "#ffc529" },
      { key: "address", title: "收货地址", icon: "location", color: "#1fc36a" },
      { key: "service", title: "联系客服", icon: "service-o", color: "#2f80ed" },
      { key: "settings", title: "设置", icon: "setting-o", color: "#111" },
    ],
  },

  onShow() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync("userInfo");
    const orders = wx.getStorageSync("mockOrders") || [];
    const posts = wx.getStorageSync(DISCOVER_STORAGE_KEY) || [];
    const publishedCount = posts.filter((item) => item.isCustom).length;
    const favoriteCount = posts.filter((item) => item.collected).length;
    const stats = [
      { key: "orders", label: "我的订单", value: orders.length },
      { key: "posts", label: "我的发布", value: publishedCount },
      { key: "favorites", label: "我的收藏", value: favoriteCount },
      { key: "points", label: "我的积分", value: 128 },
    ];
    this.setData({
      stats,
      userInfo: userInfo || null,
      hasUserInfo: !!userInfo,
    });
  },

  onLogin() {
    wx.showModal({
      title: "模拟登录",
      editable: true,
      placeholderText: "请输入你的昵称",
      success: (res) => {
        if (res.confirm && res.content) {
          const userInfo = {
            nickName: res.content,
            avatarUrl: "/images/avatar.png",
          };
          app.globalData.userInfo = userInfo;
          wx.setStorageSync("userInfo", userInfo);
          this.setData({ userInfo, hasUserInfo: true });
          wx.showToast({ title: "登录成功" });
        }
      },
    });
  },

  onNotifyTap() {
    wx.switchTab({ url: "/pages/message/index" });
  },

  onSettingsTap() {
    wx.showToast({ title: "设置页后续接入", icon: "none" });
  },

  onProfileTap() {
    wx.showToast({ title: "个人主页后续接入", icon: "none" });
  },

  onCouponTap() {
    wx.showToast({ title: "领券中心后续接入", icon: "none" });
  },

  onOrderListTap() {
    wx.navigateTo({ url: "/pages/order/list?filter=allOrders" });
  },

  openMinePosts(mode) {
    wx.navigateTo({ url: `/pages/mine/posts/index?mode=${mode}` });
  },

  onStatTap(e) {
    const key = e.currentTarget.dataset.key;
    if (key === "orders") {
      this.onOrderListTap();
      return;
    }
    if (key === "posts") {
      this.openMinePosts("published");
      return;
    }
    if (key === "favorites") {
      this.openMinePosts("favorites");
      return;
    }
    wx.showToast({ title: "积分体系后续接入", icon: "none" });
  },

  onFeatureTap(e) {
    const key = e.currentTarget.dataset.key;
    const orderKeys = ["allOrders", "pay", "doing", "comment", "refund", "done"];
    if (orderKeys.includes(key)) {
      wx.navigateTo({ url: `/pages/order/list?filter=${key}` });
      return;
    }
    if (key === "published") {
      this.openMinePosts("published");
      return;
    }
    if (key === "favorites") {
      this.openMinePosts("favorites");
      return;
    }
    if (key === "address") {
      wx.navigateTo({ url: "/pages/address/index" });
      return;
    }
    wx.showToast({ title: `${e.currentTarget.dataset.title}后续接入`, icon: "none" });
  },
});
