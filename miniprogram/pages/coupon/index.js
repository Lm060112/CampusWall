const COUPONS = [
  { id: "c1", title: "校园咖啡满减券", desc: "满20减5，校内咖啡可用", amount: "¥5", status: "available" },
  { id: "c2", title: "外卖新客券", desc: "校外外卖订单可用", amount: "¥8", status: "available" },
  { id: "c3", title: "跑腿服务券", desc: "跑腿代取满10可用", amount: "¥3", status: "claimed" },
  { id: "c4", title: "周边活动券", desc: "活动预约可抵扣", amount: "¥10", status: "used" },
];

Page({
  data: {
    tabs: [
      { key: "all", title: "全部" },
      { key: "available", title: "可领取" },
      { key: "claimed", title: "已领取" },
      { key: "used", title: "已使用" },
    ],
    activeTab: "all",
    coupons: [],
  },

  onShow() {
    this.loadCoupons();
  },

  loadCoupons() {
    const saved = wx.getStorageSync("mockCoupons");
    const coupons = Array.isArray(saved) && saved.length ? saved : COUPONS;
    const visible = this.data.activeTab === "all" ? coupons : coupons.filter((item) => item.status === this.data.activeTab);
    this.setData({ coupons: visible });
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.key }, () => this.loadCoupons());
  },

  onClaimTap(e) {
    const id = e.currentTarget.dataset.id;
    const saved = wx.getStorageSync("mockCoupons");
    const coupons = (Array.isArray(saved) && saved.length ? saved : COUPONS).map((item) => (
      item.id === id ? { ...item, status: "claimed" } : item
    ));
    wx.setStorageSync("mockCoupons", coupons);
    wx.showToast({ title: "领取成功" });
    this.loadCoupons();
  },

  onBack() {
    wx.navigateBack();
  },
});
