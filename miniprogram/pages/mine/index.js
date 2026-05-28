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
      { key: "sold", title: "我卖出的", icon: "notes-o", color: "#ff7a45" },
      { key: "bought", title: "我买到的", icon: "bag-o", color: "#2f80ed" },
      { key: "history", title: "浏览记录", icon: "bar-chart-o", color: "#8b62f2" },
    ],
    menuItems: [
      { key: "favorites", title: "我的收藏", icon: "star", color: "#ffc529" },
      { key: "address", title: "收货地址", icon: "location", color: "#1fc36a" },
      { key: "service", title: "联系客服", icon: "service-o", color: "#2f80ed" },
      { key: "settings", title: "设置", icon: "setting-o", color: "#111" },
    ],
    canManage: false,
    roleText: "",
  },

  onShow() {
    const userInfo = wx.getStorageSync("userInfo") || null;
    app.globalData.userInfo = userInfo;

    const orders = wx.getStorageSync("mockOrders") || [];
    const posts = wx.getStorageSync(DISCOVER_STORAGE_KEY) || [];
    const publishedCount = posts.filter((item) => item.isCustom).length;
    const favoriteCount = posts.filter((item) => item.collected).length;
    const stats = [
      { key: "orders", label: "我的订单", value: orders.length },
      { key: "posts", label: "我的发布", value: publishedCount },
      { key: "favorites", label: "我的收藏", value: favoriteCount },
      { key: "points", label: "我的积分", value: userInfo ? 128 : 0 },
    ];

    this.setData({
      stats,
      userInfo,
      hasUserInfo: !!userInfo,
      canManage: this.canManage(userInfo),
      roleText: this.getRoleText(userInfo && userInfo.role),
    });
    this.refreshCloudUser();
  },

  canManage(userInfo) {
    return !!(userInfo && ["admin", "merchant_staff", "runner"].includes(userInfo.role));
  },

  getRoleText(role) {
    const map = {
      admin: "管理员",
      merchant_staff: "运营人员",
      runner: "跑腿人员",
      student: "学生",
    };
    return map[role] || "";
  },

  async refreshCloudUser() {
    if (!this.data.hasUserInfo || !wx.cloud) return;
    try {
      const res = await wx.cloud.callFunction({
        name: "campusApi",
        data: { action: "getCurrentUser" },
      });
      const user = res.result && res.result.success && res.result.data && res.result.data.user;
      if (!user) return;
      const nextUserInfo = {
        ...this.data.userInfo,
        _id: user._id || this.data.userInfo._id,
        openid: user._openid || this.data.userInfo.openid,
        role: user.role || "student",
        permissions: user.permissions || [],
      };
      wx.setStorageSync("userInfo", nextUserInfo);
      app.globalData.userInfo = nextUserInfo;
      this.setData({
        userInfo: nextUserInfo,
        canManage: this.canManage(nextUserInfo),
        roleText: this.getRoleText(nextUserInfo.role),
      });
    } catch (err) {
      console.warn("refresh cloud user failed", err);
    }
  },

  ensureLogin() {
    if (this.data.hasUserInfo) return true;
    wx.navigateTo({ url: "/pages/login/index" });
    return false;
  },

  onLogin() {
    wx.navigateTo({ url: "/pages/login/index" });
  },

  onNotifyTap() {
    wx.switchTab({ url: "/pages/message/index" });
  },

  onSettingsTap() {
    wx.navigateTo({ url: "/pages/settings/index" });
  },

  onProfileTap() {
    if (!this.ensureLogin()) return;
    wx.navigateTo({ url: "/pages/profile/index" });
  },

  onCouponTap() {
    wx.navigateTo({ url: "/pages/coupon/index" });
  },

  onOrderListTap() {
    if (!this.ensureLogin()) return;
    wx.navigateTo({ url: "/pages/order/list?filter=allOrders" });
  },

  openMinePosts(mode) {
    if (!this.ensureLogin()) return;
    wx.navigateTo({ url: `/pages/mine/posts/index?mode=${mode}` });
  },

  onStatTap(e) {
    const key = e.currentTarget.dataset.key;
    if (!this.ensureLogin()) return;
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
    if (key === "points") {
      wx.navigateTo({ url: "/pages/coupon/index" });
    }
  },

  onFeatureTap(e) {
    const key = e.currentTarget.dataset.key;
    if (key !== "settings" && key !== "service" && !this.ensureLogin()) return;

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
    if (key === "sold") {
      wx.navigateTo({ url: "/pages/mine/trades/index?mode=sold" });
      return;
    }
    if (key === "bought") {
      wx.navigateTo({ url: "/pages/mine/trades/index?mode=bought" });
      return;
    }
    if (key === "history") {
      wx.navigateTo({ url: "/pages/history/index/index" });
      return;
    }
    if (key === "address") {
      wx.navigateTo({ url: "/pages/address/index" });
      return;
    }
    if (key === "service") {
      wx.navigateTo({ url: "/pages/scan/result/index?type=service" });
      return;
    }
    if (key === "admin") {
      wx.navigateTo({ url: "/pages/admin/index" });
      return;
    }
    if (key === "settings") {
      wx.navigateTo({ url: "/pages/settings/index" });
    }
  },
});
