const SERVICE_CARDS = [
  { key: "canteen", title: "校内点单", desc: "校内服务在线点\n到店自取少排队", icon: "shop-o", theme: "green" },
  { key: "takeaway", title: "校外外卖", desc: "周边美食送到寝\n优惠多多", icon: "logistics", theme: "orange" },
  { key: "errand", title: "跑腿代取", desc: "代取快递/代买\n省时又省心", icon: "guide-o", theme: "blue" },
  { key: "nearby", title: "周边玩乐", desc: "周边好去处\n玩乐随心选", icon: "photograph", theme: "purple" },
];

const FALLBACK_RECOMMENDATIONS = [
  { id: "campus-cafe", name: "崇明校区咖啡厅", badge: "校内自营", eta: "10-15分钟自取", price: "16", image: "/images/default-goods-image.png" },
  { id: "noodle-window", name: "一食堂面食窗口", badge: "出餐快", eta: "8-12分钟自取", price: "18", image: "/images/default-goods-image.png" },
  { id: "takeaway-hot", name: "川味小馆（崇明店）", badge: "新客减5元", eta: "35分钟送达", price: "20", image: "/images/default-goods-image.png" },
];

const FALLBACK_MERCHANT = {
  id: "takeaway-hot",
  name: "川味小馆（崇明店）",
  tag: "川湘快餐",
  distance: "1.2km",
  rating: "4.8",
  coupons: ["新客减5元", "满29减5", "满49减10"],
  sales: "月售 862",
  eta: "35分钟送达",
  image: "/images/default-goods-image.png",
};

const FALLBACK_ANNOUNCEMENTS = [
  { id: "a1", type: "通知", title: "关于秋季学期宿舍电费充值的通知", date: "09-06" },
  { id: "a2", type: "活动", title: "迎新嘉年华 | 趣味打卡赢好礼", date: "09-05" },
];

function callCampusApi(data) {
  return wx.cloud.callFunction({
    name: "campusApi",
    data,
  });
}

Page({
  data: {
    campusName: "崇明校区",
    serviceCards: SERVICE_CARDS,
    recommendations: FALLBACK_RECOMMENDATIONS,
    nearbyMerchant: FALLBACK_MERCHANT,
    announcements: FALLBACK_ANNOUNCEMENTS,
    loadingHome: false,
  },

  onLoad() {
    this.fetchHomeData();
  },

  onPullDownRefresh() {
    this.fetchHomeData().finally(() => wx.stopPullDownRefresh());
  },

  async fetchHomeData() {
    this.setData({ loadingHome: true });
    try {
      const result = await callCampusApi({ action: "getHomeData" });
      if (!result.result || !result.result.success || !result.result.data) {
        throw new Error((result.result && result.result.errMsg) || "get home data failed");
      }
      const data = result.result.data;
      this.setData({
        recommendations: data.recommendations && data.recommendations.length ? data.recommendations : FALLBACK_RECOMMENDATIONS,
        nearbyMerchant: data.nearbyMerchant || FALLBACK_MERCHANT,
        announcements: data.announcements && data.announcements.length ? data.announcements : FALLBACK_ANNOUNCEMENTS,
      });
    } catch (err) {
      console.warn("load cloud home data failed, use fallback", err);
      this.setData({
        recommendations: FALLBACK_RECOMMENDATIONS,
        nearbyMerchant: FALLBACK_MERCHANT,
        announcements: FALLBACK_ANNOUNCEMENTS,
      });
    } finally {
      this.setData({ loadingHome: false });
    }
  },

  onCampusTap() {
    wx.showToast({ title: "当前为崇明校区演示数据", icon: "none" });
  },

  onScanTap() {
    wx.navigateTo({ url: "/pages/scan/result/index?type=pickup" });
  },

  onServiceTap(e) {
    const { key } = e.currentTarget.dataset;
    const routes = {
      canteen: "/pages/campus-order/index",
      takeaway: "/pages/takeaway/index",
      errand: "/pages/errand/index",
      nearby: "/pages/nearby/index",
    };
    if (routes[key]) wx.navigateTo({ url: routes[key] });
  },

  onMoreTap(e) {
    const name = e.currentTarget.dataset.name || "";
    if (name.includes("公告")) {
      wx.navigateTo({ url: "/pages/announcement/detail/index?id=a1" });
      return;
    }
    wx.navigateTo({ url: `/pages/search/index?keyword=${encodeURIComponent(name)}` });
  },

  onProductTap(e) {
    const id = e.currentTarget.dataset.id || "takeaway-hot";
    wx.navigateTo({ url: `/pages/merchant/detail?id=${id}` });
  },

  onMerchantTap() {
    const id = this.data.nearbyMerchant.id || "takeaway-hot";
    wx.navigateTo({ url: `/pages/merchant/detail?id=${id}` });
  },

  onAnnouncementTap(e) {
    const id = e.currentTarget.dataset.id || "a1";
    wx.navigateTo({ url: `/pages/announcement/detail/index?id=${id}` });
  },
});
