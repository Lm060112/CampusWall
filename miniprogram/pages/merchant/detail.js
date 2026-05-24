const SERVICE_MENUS = {
  "campus-cafe": {
    merchant: {
      name: "崇明校区咖啡厅",
      tag: "咖啡饮品",
      rating: "4.9",
      distance: "图书馆一楼",
      eta: "10-15分钟自取",
      sales: "今日已出 86 单",
      address: "崇明校区图书馆一楼西侧",
      notice: "下单后请留意取餐通知，课间高峰建议提前 10 分钟下单。",
      coupons: ["学生价", "自取免排队", "第二杯半价"],
      coverUrl: "/images/default-goods-image.png",
    },
    categories: ["热销", "咖啡", "茶饮", "轻食"],
    products: [
      { id: "c1", category: "热销", name: "拿铁咖啡", desc: "默认热饮，可备注少冰/少糖", price: 1600, sales: "今日 36", image: "/images/default-goods-image.png" },
      { id: "c2", category: "热销", name: "冰美式", desc: "清爽提神，课前快速取", price: 1200, sales: "今日 42", image: "/images/default-goods-image.png" },
      { id: "c3", category: "咖啡", name: "燕麦拿铁", desc: "燕麦奶替换，口感更轻", price: 1800, sales: "今日 21", image: "/images/default-goods-image.png" },
      { id: "c4", category: "茶饮", name: "茉莉柠檬茶", desc: "清爽解腻，默认少糖", price: 1100, sales: "今日 29", image: "/images/default-goods-image.png" },
      { id: "c5", category: "轻食", name: "火腿芝士三明治", desc: "适合早餐和下午课间", price: 1500, sales: "今日 18", image: "/images/default-goods-image.png" },
    ],
  },
  "noodle-window": {
    merchant: {
      name: "一食堂面食窗口",
      tag: "食堂窗口",
      rating: "4.8",
      distance: "一食堂二楼",
      eta: "8-12分钟自取",
      sales: "今日已出 132 单",
      address: "崇明校区一食堂二楼 03 窗口",
      notice: "午餐高峰请按取餐号取餐，堂食和打包都可备注。",
      coupons: ["校内窗口", "出餐快", "支持打包"],
      coverUrl: "/images/default-goods-image.png",
    },
    categories: ["热销", "面食", "盖饭", "汤品"],
    products: [
      { id: "n1", category: "热销", name: "招牌牛肉面", desc: "大块牛肉，汤底浓郁", price: 1800, sales: "今日 58", image: "/images/default-goods-image.png" },
      { id: "n2", category: "热销", name: "香辣鸡腿饭", desc: "微辣口味，配菜每日更新", price: 1600, sales: "今日 46", image: "/images/default-goods-image.png" },
      { id: "n3", category: "面食", name: "番茄鸡蛋面", desc: "酸甜口，适合清淡一点", price: 1200, sales: "今日 35", image: "/images/default-goods-image.png" },
      { id: "n4", category: "盖饭", name: "黑椒牛柳盖饭", desc: "黑椒香气足，默认微辣", price: 1700, sales: "今日 31", image: "/images/default-goods-image.png" },
      { id: "n5", category: "汤品", name: "紫菜蛋花汤", desc: "单点汤品，温热取餐", price: 500, sales: "今日 24", image: "/images/default-goods-image.png" },
    ],
  },
  "light-meal": {
    merchant: {
      name: "二食堂轻食窗口",
      tag: "轻食小吃",
      rating: "4.7",
      distance: "二食堂一楼",
      eta: "12-18分钟自取",
      sales: "今日已出 64 单",
      address: "崇明校区二食堂一楼东侧",
      notice: "轻食类现做较多，晚课前建议提前下单。",
      coupons: ["低脂套餐", "晚餐友好", "支持自取"],
      coverUrl: "/images/default-goods-image.png",
    },
    categories: ["热销", "沙拉", "小吃", "饮品"],
    products: [
      { id: "l1", category: "热销", name: "鸡胸肉能量碗", desc: "鸡胸肉、玉米、鸡蛋和时蔬", price: 2200, sales: "今日 22", image: "/images/default-goods-image.png" },
      { id: "l2", category: "热销", name: "酥炸小吃拼盘", desc: "鸡米花、薯条和年糕组合", price: 1500, sales: "今日 33", image: "/images/default-goods-image.png" },
      { id: "l3", category: "沙拉", name: "金枪鱼沙拉", desc: "清爽低负担，默认油醋汁", price: 1900, sales: "今日 15", image: "/images/default-goods-image.png" },
      { id: "l4", category: "小吃", name: "烤肠双拼", desc: "原味加黑椒，课间补能", price: 900, sales: "今日 28", image: "/images/default-goods-image.png" },
      { id: "l5", category: "饮品", name: "冰柠檬茶", desc: "清爽解腻，少冰默认", price: 600, sales: "今日 37", image: "/images/default-goods-image.png" },
    ],
  },
  "campus-store": {
    merchant: {
      name: "校园便利服务点",
      tag: "便利服务",
      rating: "4.6",
      distance: "宿舍区",
      eta: "营业后自取",
      sales: "今日已出 28 单",
      address: "崇明校区宿舍区 6 号楼旁",
      notice: "当前为演示状态，后续可接入营业时间和库存。",
      coupons: ["日用品", "饮料零食", "宿舍区"],
      coverUrl: "/images/default-goods-image.png",
    },
    categories: ["热销", "饮料", "零食", "日用品"],
    products: [
      { id: "s1", category: "热销", name: "矿泉水", desc: "宿舍区常备，按瓶购买", price: 200, sales: "今日 40", image: "/images/default-goods-image.png" },
      { id: "s2", category: "热销", name: "纸巾", desc: "抽纸一包，宿舍备用", price: 450, sales: "今日 18", image: "/images/default-goods-image.png" },
      { id: "s3", category: "饮料", name: "无糖茶", desc: "冰柜冷藏，营业后自取", price: 550, sales: "今日 16", image: "/images/default-goods-image.png" },
      { id: "s4", category: "零食", name: "全麦面包", desc: "早餐和夜宵都方便", price: 650, sales: "今日 21", image: "/images/default-goods-image.png" },
      { id: "s5", category: "日用品", name: "洗衣液小瓶装", desc: "宿舍生活补给", price: 1200, sales: "今日 8", image: "/images/default-goods-image.png" },
    ],
  },
};

const DEFAULT_SERVICE_ID = "campus-cafe";

Page({
  data: {
    merchant: SERVICE_MENUS[DEFAULT_SERVICE_ID].merchant,
    categories: SERVICE_MENUS[DEFAULT_SERVICE_ID].categories,
    activeCategory: "热销",
    products: SERVICE_MENUS[DEFAULT_SERVICE_ID].products,
    visibleProducts: [],
    cart: {},
    cartCount: 0,
    cartAmount: 0,
  },

  onLoad(options = {}) {
    const menu = SERVICE_MENUS[options.id] || SERVICE_MENUS[DEFAULT_SERVICE_ID];
    this.setData({
      merchant: menu.merchant,
      categories: menu.categories,
      activeCategory: menu.categories[0],
      products: menu.products,
      cart: {},
      cartCount: 0,
      cartAmount: 0,
    }, () => this.applyCategory());
  },

  onCategoryTap(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.category }, () => {
      this.applyCategory();
    });
  },

  applyCategory() {
    const active = this.data.activeCategory;
    this.setData({
      visibleProducts: this.data.products.filter((item) => item.category === active),
    });
  },

  getProductById(id) {
    return this.data.products.find((item) => item.id === id);
  },

  recalcCart(cart) {
    let cartCount = 0;
    let cartAmount = 0;
    Object.keys(cart).forEach((id) => {
      const count = cart[id] || 0;
      const product = this.getProductById(id);
      if (!product || count <= 0) return;
      cartCount += count;
      cartAmount += count * product.price;
    });
    this.setData({ cart, cartCount, cartAmount });
  },

  onAdd(e) {
    const id = e.currentTarget.dataset.id;
    const cart = { ...this.data.cart };
    cart[id] = (cart[id] || 0) + 1;
    this.recalcCart(cart);
  },

  onMinus(e) {
    const id = e.currentTarget.dataset.id;
    const cart = { ...this.data.cart };
    cart[id] = Math.max((cart[id] || 0) - 1, 0);
    if (cart[id] === 0) delete cart[id];
    this.recalcCart(cart);
  },

  onCheckout() {
    if (!this.data.cartCount) {
      wx.showToast({ title: "请先选择商品", icon: "none" });
      return;
    }
    const items = Object.keys(this.data.cart)
      .map((id) => {
        const product = this.getProductById(id);
        const count = this.data.cart[id];
        if (!product || !count) return null;
        return {
          id,
          name: product.name,
          price: product.price,
          count,
          image: product.image,
        };
      })
      .filter(Boolean);
    const draft = {
      merchant: {
        name: this.data.merchant.name,
        tag: this.data.merchant.tag,
        address: this.data.merchant.address,
        eta: this.data.merchant.eta,
      },
      items,
      totalAmount: this.data.cartAmount,
      pickupType: "到店自取",
      sourceType: "campus",
      createdAt: Date.now(),
    };
    wx.navigateTo({
      url: `/pages/order/confirm?draft=${encodeURIComponent(JSON.stringify(draft))}`,
    });
  },

  onBack() {
    wx.navigateBack();
  },
});
