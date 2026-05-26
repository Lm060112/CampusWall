const SAMPLE_ORDER = {
  id: "DEMO_ORDER_1",
  pickupNo: "A108",
  merchant: {
    name: "校园咖啡厅",
    tag: "校内服务",
    address: "崇明校区图书馆一楼",
    eta: "15分钟",
  },
  items: [{ id: "coffee", name: "拿铁", price: 1600, count: 1, image: "/images/default-goods-image.png" }],
  totalAmount: 1600,
  pickupType: "到店自取",
  sourceType: "campus",
  status: "待取餐",
  statusText: "餐品已备好",
  paid: true,
  submittedAt: Date.now(),
};

Page({
  data: {},

  onGenerateTap() {
    const posts = wx.getStorageSync("campus_discover_posts") || [];
    const demoPost = {
      id: `demo_post_${Date.now()}`,
      isCustom: true,
      author: "校园用户",
      avatar: "/images/avatar.png",
      tag: "求助",
      topic: "演示数据",
      content: "这是一条用于演示校园墙流程的本地帖子。",
      location: "崇明校区",
      images: [],
      likes: 3,
      comments: [{ id: "demo_comment", nickname: "同学A", content: "收到，帮顶。" }],
      createdAt: Date.now(),
      collected: true,
    };
    wx.setStorageSync("campus_discover_posts", [demoPost, ...posts]);
    wx.setStorageSync("mockOrders", [SAMPLE_ORDER, ...(wx.getStorageSync("mockOrders") || [])]);
    wx.setStorageSync("mockMessages", [{
      id: `DEMO_MSG_${Date.now()}`,
      type: "order",
      orderId: SAMPLE_ORDER.id,
      title: "演示订单待取餐",
      content: "校园咖啡厅的拿铁已备好，请到图书馆一楼领取。",
      status: "待取餐",
      statusClass: "processing",
      icon: "/images/default-goods-image.png",
      unread: true,
      createdAt: Date.now(),
    }, ...(wx.getStorageSync("mockMessages") || [])]);
    wx.showToast({ title: "演示数据已生成" });
  },

  onClearTap() {
    ["mockOrders", "mockMessages", "campus_discover_posts", "mockCoupons", "mockBrowseHistory", "readMessageIds"].forEach((key) => wx.removeStorageSync(key));
    wx.showToast({ title: "已清空" });
  },

  onBack() {
    wx.navigateBack();
  },
});
