const SERVICE_RESULTS = [
  { id: "s1", type: "服务", title: "校内点单", desc: "校内咖啡、食堂窗口、便利服务", url: "/pages/campus-order/index" },
  { id: "s2", type: "服务", title: "校外外卖", desc: "模拟外卖点餐、规格和购物车", url: "/pages/takeaway/index" },
  { id: "s3", type: "服务", title: "跑腿代取", desc: "快递、代买、代送需求发布", url: "/pages/errand/index" },
  { id: "s4", type: "服务", title: "周边玩乐", desc: "活动预约、周边体验", url: "/pages/nearby/index" },
  { id: "s5", type: "功能", title: "我的订单", desc: "查看订单、评价、售后", url: "/pages/order/list?filter=allOrders" },
  { id: "s6", type: "功能", title: "收货地址", desc: "新增、编辑、默认地址", url: "/pages/address/index" },
];

const POST_RESULTS = [
  { id: "p1", type: "帖子", title: "闲置耳机转让", desc: "九成新蓝牙耳机，校园内自提" },
  { id: "p2", type: "帖子", title: "食堂二楼捡到校园卡", desc: "失物招领，服务台认领" },
  { id: "p3", type: "活动", title: "周六羽毛球友谊赛", desc: "新手友好，赢了有小礼品" },
];

Page({
  data: {
    keyword: "",
    activeType: "all",
    tabs: [
      { key: "all", title: "全部" },
      { key: "服务", title: "服务" },
      { key: "帖子", title: "帖子" },
      { key: "功能", title: "功能" },
    ],
    hotWords: ["咖啡", "外卖", "校园卡", "羽毛球", "跑腿", "订单"],
    results: [],
  },

  onLoad(options = {}) {
    const keyword = options.keyword || "";
    this.setData({ keyword }, () => this.search());
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value || "" }, () => this.search());
  },

  onTabTap(e) {
    this.setData({ activeType: e.currentTarget.dataset.key }, () => this.search());
  },

  onHotTap(e) {
    this.setData({ keyword: e.currentTarget.dataset.word }, () => this.search());
  },

  search() {
    const keyword = this.data.keyword.trim().toLowerCase();
    const all = SERVICE_RESULTS.concat(POST_RESULTS);
    const results = all.filter((item) => {
      const typeMatched = this.data.activeType === "all" || item.type === this.data.activeType;
      const text = `${item.title}${item.desc}${item.type}`.toLowerCase();
      return typeMatched && (!keyword || text.includes(keyword));
    });
    this.setData({ results });
  },

  onResultTap(e) {
    const target = this.data.results.find((item) => item.id === e.currentTarget.dataset.id);
    if (!target) return;
    if (target.url) {
      wx.navigateTo({ url: target.url });
      return;
    }
    wx.switchTab({ url: "/pages/discover/index" });
  },

  onBack() {
    wx.navigateBack();
  },
});
