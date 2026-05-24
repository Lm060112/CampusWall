const CATEGORIES = ["全部", "咖啡饮品", "食堂窗口", "轻食小吃", "便利服务"];

const SERVICES = [
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
  {
    id: "light-meal",
    name: "二食堂轻食窗口",
    category: "轻食小吃",
    status: "营业中",
    location: "二食堂一楼东侧",
    pickupTime: "12-18分钟自取",
    rating: "4.7",
    tags: ["轻食沙拉", "低脂套餐", "晚餐友好"],
    notice: "轻食、三明治和小吃，适合晚课前后补充能量。",
    image: "/images/default-goods-image.png",
  },
  {
    id: "campus-store",
    name: "校园便利服务点",
    category: "便利服务",
    status: "休息中",
    location: "宿舍区 6 号楼旁",
    pickupTime: "次日 08:30 后自取",
    rating: "4.6",
    tags: ["日用品", "饮料零食", "宿舍区"],
    notice: "日用品和饮料零食，营业后可继续下单。",
    image: "/images/default-goods-image.png",
  },
];

Page({
  data: {
    campusName: "崇明校区",
    categories: CATEGORIES,
    activeCategory: "全部",
    services: SERVICES,
    visibleServices: SERVICES,
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
    wx.showToast({ title: "校内服务搜索待接入", icon: "none" });
  },

  onBack() {
    wx.navigateBack();
  },
});
