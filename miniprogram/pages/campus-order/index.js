const CATEGORIES = ["全部", "咖啡饮品", "食堂窗口", "轻食小吃", "便利服务"];

const FALLBACK_SERVICES = [
  {
    id: "campus-cafe",
    name: "崇明校区咖啡厅",
    category: "咖啡饮品",
    status: "营业中",
    location: "图书馆一楼西侧",
    pickupTime: "10-15分钟自取",
    rating: "4.9",
    tags: ["校内自营", "课间高峰", "支持自取"],
    notice: "咖啡、茶饮和轻食，适合课间快速取餐。",
    image: "/images/default-goods-image.png",
  },
  {
    id: "noodle-window",
    name: "一食堂面食窗口",
    category: "食堂窗口",
    status: "营业中",
    location: "一食堂二楼 03 窗口",
    pickupTime: "8-12分钟自取",
    rating: "4.8",
    tags: ["食堂窗口", "午餐推荐", "出餐快"],
    notice: "面食、盖饭和汤品，午餐高峰建议提前下单。",
    image: "/images/default-goods-image.png",
  },
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
    categories: CATEGORIES,
    activeCategory: "全部",
    services: FALLBACK_SERVICES,
    visibleServices: FALLBACK_SERVICES,
  },

  onLoad() {
    this.loadServices();
  },

  async loadServices() {
    try {
      const result = await callCampusApi({ action: "listMerchants", sourceType: "campus", pageSize: 100 });
      if (!result.result || !result.result.success) {
        throw new Error((result.result && result.result.errMsg) || "list merchants failed");
      }
      const services = (result.result.data || []).map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        status: item.status,
        location: item.distance || item.address,
        pickupTime: item.eta,
        rating: item.rating,
        tags: item.coupons || [],
        notice: item.notice,
        image: item.image || item.coverUrl || "/images/default-goods-image.png",
      }));
      this.setData({
        services: services.length ? services : FALLBACK_SERVICES,
      }, () => this.applyCategory());
    } catch (err) {
      console.warn("load cloud campus services failed, use fallback", err);
      this.setData({ services: FALLBACK_SERVICES }, () => this.applyCategory());
    }
  },

  onCategoryTap(e) {
    const activeCategory = e.currentTarget.dataset.category;
    this.setData({ activeCategory }, () => this.applyCategory());
  },

  applyCategory() {
    const { activeCategory, services } = this.data;
    const visibleServices = activeCategory === "全部"
      ? services
      : services.filter((item) => item.category === activeCategory);
    this.setData({ visibleServices });
  },

  onServiceTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/merchant/detail?id=${id}&scene=campus` });
  },

  onSearchTap() {
    wx.navigateTo({ url: "/pages/search/index?keyword=校内服务" });
  },

  onBack() {
    wx.navigateBack();
  },
});
