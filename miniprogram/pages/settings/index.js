const app = getApp();

Page({
  data: {
    cacheItems: [
      { key: "mockOrders", title: "模拟订单" },
      { key: "mockMessages", title: "模拟消息" },
      { key: "campus_discover_posts", title: "校园墙本地内容" },
      { key: "mockAddresses", title: "地址列表" },
    ],
  },

  onBack() {
    wx.navigateBack();
  },

  onClearCache() {
    wx.showModal({
      title: "清除本地模拟数据",
      content: "会清除订单、消息、发现页本地发布和地址列表，适合重新演示流程。",
      success: (res) => {
        if (!res.confirm) return;
        this.data.cacheItems.forEach((item) => wx.removeStorageSync(item.key));
        wx.removeStorageSync("mockDefaultAddress");
        wx.removeStorageSync("readMessageIds");
        wx.showToast({ title: "已清除" });
      },
    });
  },

  onLogout() {
    wx.showModal({
      title: "退出登录",
      content: "当前是前端模拟登录，只会清除本机用户信息。",
      success: (res) => {
        if (!res.confirm) return;
        app.globalData.userInfo = null;
        wx.removeStorageSync("userInfo");
        wx.showToast({ title: "已退出" });
        setTimeout(() => wx.navigateBack(), 600);
      },
    });
  },

  onContactTap() {
    wx.showToast({ title: "客服入口后续接入", icon: "none" });
  },

  onLegalTap(e) {
    wx.navigateTo({ url: `/pages/legal/index?type=${e.currentTarget.dataset.type}` });
  },

  onDemoTap() {
    wx.navigateTo({ url: "/pages/demo/index/index" });
  },
});
