const RESULTS = [
  { id: "campus-cafe", type: "校内服务", title: "崇明校区咖啡厅", desc: "咖啡、茶饮、轻食，到店自取", url: "/pages/merchant/detail?id=campus-cafe&scene=campus" },
  { id: "noodle-window", type: "校内服务", title: "一食堂面食窗口", desc: "午餐窗口，面食盖饭提前点", url: "/pages/merchant/detail?id=noodle-window&scene=campus" },
  { id: "takeaway", type: "外卖", title: "校外外卖", desc: "像普通外卖平台一样选商家、选商品、结算", url: "/pages/takeaway/index" },
  { id: "errand", type: "跑腿", title: "跑腿代取", desc: "代取快递、代买、代送需求发布", url: "/pages/errand/index" },
  { id: "nearby", type: "活动", title: "周边玩乐", desc: "周边活动、预约体验和报名", url: "/pages/nearby/index" },
  { id: "orders", type: "功能", title: "我的订单", desc: "查看订单、支付、售后和评价", url: "/pages/order/list?filter=allOrders" },
  { id: "address", type: "功能", title: "收货地址", desc: "新增、编辑和设置默认地址", url: "/pages/address/index" },
  { id: "announce", type: "公告", title: "宿舍电费充值通知", desc: "校园公告和服务通知", url: "/pages/announcement/detail/index?id=a1" },
  { id: "idle", type: "帖子", title: "闲置耳机转让", desc: "九成新蓝牙耳机，校内自提", tab: "闲置" },
  { id: "lost", type: "帖子", title: "食堂二楼捡到校园卡", desc: "失物招领，服务台认领", tab: "求助" },
];

Page({
  data: {
    keyword: "",
    activeType: "全部",
    tabs: ["全部", "校内服务", "外卖", "帖子", "公告", "功能"],
    hotWords: ["咖啡", "外卖", "校园卡", "羽毛球", "跑腿", "订单"],
    historyWords: [],
    results: [],
  },

  onLoad(options = {}) {
    const keyword = options.keyword || "";
    this.setData({
      keyword,
      historyWords: wx.getStorageSync("searchHistory") || [],
    }, () => this.search());
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value || "" }, () => this.search());
  },

  onTabTap(e) {
    this.setData({ activeType: e.currentTarget.dataset.key }, () => this.search());
  },

  onHotTap(e) {
    const word = e.currentTarget.dataset.word;
    this.setData({ keyword: word }, () => this.search(true));
  },

  search(saveHistory = false) {
    const keyword = this.data.keyword.trim().toLowerCase();
    const results = RESULTS.filter((item) => {
      const typeMatched = this.data.activeType === "全部" || item.type === this.data.activeType;
      const text = `${item.title}${item.desc}${item.type}`.toLowerCase();
      return typeMatched && (!keyword || text.includes(keyword));
    });
    this.setData({ results });
    if (saveHistory && keyword) this.saveHistory(this.data.keyword.trim());
  },

  saveHistory(word) {
    const historyWords = [word].concat(this.data.historyWords.filter((item) => item !== word)).slice(0, 8);
    wx.setStorageSync("searchHistory", historyWords);
    this.setData({ historyWords });
  },

  onResultTap(e) {
    const target = this.data.results.find((item) => item.id === e.currentTarget.dataset.id);
    if (!target) return;
    if (this.data.keyword.trim()) this.saveHistory(this.data.keyword.trim());
    if (target.url) {
      wx.navigateTo({ url: target.url });
      return;
    }
    wx.switchTab({ url: "/pages/discover/index" });
  },

  onClearHistory() {
    wx.removeStorageSync("searchHistory");
    this.setData({ historyWords: [] });
  },

  onBack() {
    wx.navigateBack();
  },
});
