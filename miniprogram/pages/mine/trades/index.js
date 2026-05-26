Page({
  data: {
    mode: "sold",
    title: "我卖出的",
    list: [],
  },

  onLoad(options = {}) {
    const mode = options.mode === "bought" ? "bought" : "sold";
    this.setData({ mode, title: mode === "bought" ? "我买到的" : "我卖出的" });
  },

  onShow() {
    const orders = wx.getStorageSync("mockOrders") || [];
    const posts = wx.getStorageSync("campus_discover_posts") || [];
    const list = this.data.mode === "bought"
      ? orders.map((item) => ({ id: item.id, title: item.merchant.name, desc: `订单金额 ¥${item.totalAmount / 100}`, url: `/pages/order/detail?id=${item.id}` }))
      : posts.filter((item) => item.isCustom && item.tag === "闲置").map((item) => ({ id: item.id, title: item.topic || "闲置发布", desc: item.content, url: `/pages/discover/detail/index?id=${item.id}` }));
    this.setData({ list });
  },

  onItemTap(e) {
    const item = this.data.list.find((entry) => entry.id === e.currentTarget.dataset.id);
    if (item) wx.navigateTo({ url: item.url });
  },

  onBack() {
    wx.navigateBack();
  },
});
