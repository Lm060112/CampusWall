Page({
  data: {
    user: null,
    stats: [],
    posts: [],
  },

  onShow() {
    const userInfo = wx.getStorageSync("userInfo") || { nickName: "小汤圆", avatarUrl: "/images/avatar.png" };
    const posts = (wx.getStorageSync("campus_discover_posts") || []).filter((item) => item.isCustom);
    const favorites = (wx.getStorageSync("campus_discover_posts") || []).filter((item) => item.collected);
    const orders = wx.getStorageSync("mockOrders") || [];
    this.setData({
      user: userInfo,
      posts,
      stats: [
        { label: "发布", value: posts.length },
        { label: "收藏", value: favorites.length },
        { label: "订单", value: orders.length },
        { label: "积分", value: 128 },
      ],
    });
  },

  onBack() {
    wx.navigateBack();
  },

  onPostTap(e) {
    wx.navigateTo({ url: `/pages/discover/detail/index?id=${e.currentTarget.dataset.id}` });
  },
});
