const db = wx.cloud.database();

const SERVICE_CARDS = [
  {
    key: "canteen",
    title: "校内点单",
    desc: "校内服务在线点\n到店自取少排队",
    icon: "shop-o",
    theme: "green",
  },
  {
    key: "takeaway",
    title: "校外外卖",
    desc: "周边美食送到寝\n优惠多多",
    icon: "logistics",
    theme: "orange",
  },
  {
    key: "errand",
    title: "跑腿代取",
    desc: "代取快递/代买\n省时又省心",
    icon: "guide-o",
    theme: "blue",
  },
  {
    key: "nearby",
    title: "周边玩乐",
    desc: "周边好去处\n玩乐随心选",
    icon: "photograph",
    theme: "purple",
  },
];

const FALLBACK_RECOMMENDATIONS = [
  {
    id: "r1",
    name: "沪上阿姨（崇明店）",
    badge: "满减优惠",
    eta: "30分钟送达",
    price: "16",
    image: "/images/default-goods-image.png",
  },
  {
    id: "r2",
    name: "川味小馆（崇明店）",
    badge: "新客减5元",
    eta: "35分钟送达",
    price: "20",
    image: "/images/default-goods-image.png",
  },
  {
    id: "r3",
    name: "幸运咖啡",
    badge: "折扣优惠",
    eta: "25分钟送达",
    price: "18",
    image: "/images/default-goods-image.png",
  },
];

const FALLBACK_MERCHANT = {
  id: "m1",
  name: "便利蜂（崇明大道店）",
  tag: "超市便利",
  distance: "120m",
  rating: "4.8",
  coupons: ["满29减5", "满49减10", "会员日9折"],
  sales: "月售 326",
  eta: "30分钟送达",
  image: "/images/default-goods-image.png",
};

const FALLBACK_ANNOUNCEMENTS = [
  { id: "a1", type: "通知", title: "关于2024年秋季学期宿舍电费充值的通知", date: "09-06" },
  { id: "a2", type: "活动", title: "迎新嘉年华｜趣味打卡赢好礼！", date: "09-05" },
];

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

  normalizeProduct(doc) {
    return {
      id: doc._id,
      name: doc.name || doc.title || "校园好物",
      badge: doc.badge || doc.couponText || "优惠",
      eta: doc.eta || doc.deliveryTime || "30分钟送达",
      price: doc.priceText || String((doc.price || 0) / 100 || doc.price || "0"),
      image: doc.image || doc.coverUrl || "/images/default-goods-image.png",
      raw: doc,
    };
  },

  normalizeMerchant(doc) {
    return {
      id: doc._id,
      name: doc.name || "校园商家",
      tag: doc.tag || doc.category || "校园服务",
      distance: doc.distance || "校内",
      rating: doc.rating || "5.0",
      coupons: Array.isArray(doc.coupons) && doc.coupons.length ? doc.coupons : ["优惠活动"],
      sales: doc.sales || doc.salesText || "月售 0",
      eta: doc.eta || doc.deliveryTime || "30分钟送达",
      image: doc.image || doc.coverUrl || "/images/default-goods-image.png",
      raw: doc,
    };
  },

  normalizeAnnouncement(doc) {
    return {
      id: doc._id,
      type: doc.type || "通知",
      title: doc.title || "校园公告",
      date: doc.date || this.formatMonthDay(doc.createdAt || Date.now()),
      raw: doc,
    };
  },

  formatMonthDay(ts) {
    const d = new Date(Number(ts || Date.now()));
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  },

  readCollection(name, options = {}) {
    let query = db.collection(name);
    if (options.where) query = query.where(options.where);
    if (options.orderBy) query = query.orderBy(options.orderBy.field, options.orderBy.direction);
    if (options.limit) query = query.limit(options.limit);
    return query
      .get()
      .then((res) => res.data || [])
      .catch((err) => {
        console.warn(`${name} collection unavailable, fallback used`, err);
        return [];
      });
  },

  fetchHomeData() {
    this.setData({ loadingHome: true });
    return Promise.all([
      this.readCollection("products", {
        where: { status: "online" },
        orderBy: { field: "sort", direction: "asc" },
        limit: 10,
      }),
      this.readCollection("merchants", {
        where: { status: "online" },
        orderBy: { field: "sort", direction: "asc" },
        limit: 5,
      }),
      this.readCollection("announcements", {
        where: { status: "published" },
        orderBy: { field: "createdAt", direction: "desc" },
        limit: 5,
      }),
    ])
      .then(([products, merchants, announcements]) => {
        this.setData({
          recommendations: products.length ? products.map((item) => this.normalizeProduct(item)) : FALLBACK_RECOMMENDATIONS,
          nearbyMerchant: merchants.length ? this.normalizeMerchant(merchants[0]) : FALLBACK_MERCHANT,
          announcements: announcements.length ? announcements.map((item) => this.normalizeAnnouncement(item)) : FALLBACK_ANNOUNCEMENTS,
          loadingHome: false,
        });
      })
      .catch((err) => {
        console.error(err);
        this.setData({ loadingHome: false });
      });
  },

  onCampusTap() {
    wx.showToast({ title: "校区切换待接入", icon: "none" });
  },

  onSearchTap() {
    wx.showToast({ title: "搜索功能待接入", icon: "none" });
  },

  onScanTap() {
    wx.navigateTo({ url: "/pages/scan/result/index?type=pickup" });
  },

  onServiceTap(e) {
    const { key, title } = e.currentTarget.dataset;
    if (key === "canteen") {
      wx.navigateTo({ url: "/pages/campus-order/index" });
      return;
    }
    if (key === "takeaway") {
      wx.navigateTo({ url: "/pages/takeaway/index" });
      return;
    }
    if (key === "errand") {
      wx.navigateTo({ url: "/pages/errand/index" });
      return;
    }
    if (key === "nearby") {
      wx.navigateTo({ url: "/pages/nearby/index" });
      return;
    }
    wx.showToast({ title: `${title}待接入`, icon: "none" });
  },

  onMoreTap(e) {
    wx.showToast({ title: `${e.currentTarget.dataset.name}更多内容待接入`, icon: "none" });
  },

  onProductTap() {
    wx.navigateTo({ url: "/pages/merchant/detail" });
  },

  onMerchantTap() {
    wx.navigateTo({ url: "/pages/merchant/detail" });
  },

  onAnnouncementTap(e) {
    wx.showToast({ title: `${e.currentTarget.dataset.title}详情待接入`, icon: "none" });
  },
});
