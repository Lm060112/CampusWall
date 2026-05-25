Page({
  data: {
    list: [],
  },

  onShow() {
    const saved = wx.getStorageSync("mockBrowseHistory");
    const list = Array.isArray(saved) && saved.length
      ? saved
      : [
        { id: "h1", type: "帖子", title: "闲置耳机转让", desc: "发现页浏览记录示例", url: "/pages/discover/index" },
        { id: "h2", type: "活动", title: "周六羽毛球友谊赛", desc: "活动详情浏览记录示例", url: "/pages/activity/detail/index?id=a1" },
      ];
    this.setData({ list });
  },

  onItemTap(e) {
    const target = this.data.list.find((item) => item.id === e.currentTarget.dataset.id);
    if (!target || !target.url) return;
    if (target.url.includes("/pages/discover/index")) {
      wx.switchTab({ url: target.url });
      return;
    }
    wx.navigateTo({ url: target.url });
  },

  onClearTap() {
    wx.removeStorageSync("mockBrowseHistory");
    this.setData({ list: [] });
  },

  onBack() {
    wx.navigateBack();
  },
});
