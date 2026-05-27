const FALLBACK_COUPONS = [
  { id: "coupon-campus-5", title: "校园咖啡满减券", desc: "满 20 减 5，校内咖啡可用", amount: "¥5", status: "available" },
  { id: "coupon-takeaway-8", title: "外卖新客券", desc: "校外外卖订单可用", amount: "¥8", status: "available" },
  { id: "coupon-errand-3", title: "跑腿服务券", desc: "跑腿代取满 10 可用", amount: "¥3", status: "claimed" },
  { id: "coupon-nearby-10", title: "周边活动券", desc: "活动预约可抵扣", amount: "¥10", status: "used" },
];

function callCampusApi(data) {
  return wx.cloud.callFunction({
    name: "campusApi",
    data,
  });
}

Page({
  data: {
    tabs: [
      { key: "all", title: "全部" },
      { key: "available", title: "可领取" },
      { key: "claimed", title: "已领取" },
      { key: "used", title: "已使用" },
    ],
    activeTab: "all",
    allCoupons: [],
    coupons: [],
    cloudReady: false,
  },

  onShow() {
    this.loadCoupons();
  },

  async loadCoupons() {
    try {
      const result = await callCampusApi({ action: "listCoupons" });
      if (!result.result || !result.result.success) {
        throw new Error((result.result && result.result.errMsg) || "list coupons failed");
      }
      const coupons = result.result.data || [];
      this.setData({
        allCoupons: coupons.length ? coupons : FALLBACK_COUPONS,
        cloudReady: coupons.length > 0,
      }, () => this.applyTab());
    } catch (err) {
      console.warn("load cloud coupons failed, use fallback", err);
      const saved = wx.getStorageSync("mockCoupons");
      this.setData({
        allCoupons: Array.isArray(saved) && saved.length ? saved : FALLBACK_COUPONS,
        cloudReady: false,
      }, () => this.applyTab());
    }
  },

  applyTab() {
    const visible = this.data.activeTab === "all"
      ? this.data.allCoupons
      : this.data.allCoupons.filter((item) => item.status === this.data.activeTab);
    this.setData({ coupons: visible });
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.key }, () => this.applyTab());
  },

  async onClaimTap(e) {
    const id = e.currentTarget.dataset.id;
    try {
      const result = await callCampusApi({ action: "claimCoupon", couponId: id });
      if (!result.result || !result.result.success) {
        throw new Error((result.result && result.result.errMsg) || "claim coupon failed");
      }
      wx.showToast({ title: "领取成功" });
      this.loadCoupons();
    } catch (err) {
      console.warn("claim cloud coupon failed, use local fallback", err);
      const coupons = this.data.allCoupons.map((item) => (
        item.id === id ? { ...item, status: "claimed" } : item
      ));
      wx.setStorageSync("mockCoupons", coupons);
      this.setData({ allCoupons: coupons }, () => this.applyTab());
      wx.showToast({ title: "已本地领取", icon: "none" });
    }
  },

  onBack() {
    wx.navigateBack();
  },
});
