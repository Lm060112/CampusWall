const MENUS = {
  "campus-cafe": {
    scene: "campus",
    merchant: {
      name: "崇明校区咖啡厅",
      tag: "校内服务",
      rating: "4.9",
      distance: "图书馆一楼",
      eta: "10-15分钟自取",
      sales: "今日已出 86 单",
      address: "崇明校区图书馆一楼西侧",
      notice: "下单后留意取餐通知，课间高峰建议提前 10 分钟下单。",
      coupons: ["校内自营", "自取免排队", "第二杯半价"],
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
    scene: "campus",
    merchant: {
      name: "一食堂面食窗口",
      tag: "食堂窗口",
      rating: "4.8",
      distance: "一食堂二楼",
      eta: "8-12分钟自取",
      sales: "今日已出 132 单",
      address: "崇明校区一食堂二楼 03 窗口",
      notice: "午餐高峰请按取餐号取餐，堂食和打包都可备注。",
      coupons: ["食堂窗口", "出餐快", "支持打包"],
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
  "takeaway-hot": {
    scene: "takeaway",
    merchant: {
      name: "川味小馆（崇明店）",
      tag: "川湘快餐",
      rating: "4.8",
      distance: "1.2km",
      eta: "35分钟送达",
      sales: "月售 862",
      address: "崇明大道美食街 18 号",
      notice: "满 29 减 5，新客下单可使用优惠券。",
      coupons: ["新客减5元", "满29减5", "满49减10"],
      coverUrl: "/images/default-goods-image.png",
    },
    categories: ["热销", "套餐", "小炒", "饮品"],
    products: [
      { id: "t1", category: "热销", name: "香辣鸡腿饭套餐", desc: "鸡腿饭、例汤、饮品", price: 2000, sales: "月售 189", image: "/images/default-goods-image.png" },
      { id: "t2", category: "热销", name: "双人下饭套餐", desc: "两荤一素，适合拼单", price: 4200, sales: "月售 96", image: "/images/default-goods-image.png" },
      { id: "t3", category: "套餐", name: "鱼香肉丝盖饭", desc: "酸甜微辣，配送友好", price: 1800, sales: "月售 143", image: "/images/default-goods-image.png" },
      { id: "t4", category: "小炒", name: "小炒黄牛肉", desc: "香辣下饭，可选微辣", price: 2800, sales: "月售 67", image: "/images/default-goods-image.png" },
      { id: "t5", category: "饮品", name: "冰柠檬茶", desc: "解辣搭配", price: 600, sales: "月售 120", image: "/images/default-goods-image.png" },
    ],
  },
};

const DEFAULT_ID = "campus-cafe";

Page({
  data: {
    scene: "campus",
    merchant: MENUS[DEFAULT_ID].merchant,
    categories: MENUS[DEFAULT_ID].categories,
    activeCategory: "热销",
    products: MENUS[DEFAULT_ID].products,
    visibleProducts: [],
    cart: {},
    cartCount: 0,
    cartAmount: 0,
  },

  onLoad(options = {}) {
    const id = options.id === "m1" || options.id === "r2" ? "takeaway-hot" : options.id;
    const menu = MENUS[id] || MENUS[DEFAULT_ID];
    this.setData({
      scene: menu.scene,
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
    this.setData({ activeCategory: e.currentTarget.dataset.category }, () => this.applyCategory());
  },

  applyCategory() {
    this.setData({
      visibleProducts: this.data.products.filter((item) => item.category === this.data.activeCategory),
    });
  },

  getProductById(id) {
    return this.data.products.find((item) => item.id === id);
  },

  recalcCart(cart) {
    let cartCount = 0;
    let cartAmount = 0;
    Object.keys(cart).forEach((id) => {
      const product = this.getProductById(id);
      const count = cart[id] || 0;
      if (!product || count <= 0) return;
      cartCount += count;
      cartAmount += count * product.price;
    });
    this.setData({ cart, cartCount, cartAmount });
  },

  onAdd(e) {
    const id = e.currentTarget.dataset.id;
    const cart = { ...this.data.cart, [id]: (this.data.cart[id] || 0) + 1 };
    this.recalcCart(cart);
  },

  onMinus(e) {
    const id = e.currentTarget.dataset.id;
    const cart = { ...this.data.cart };
    cart[id] = Math.max((cart[id] || 0) - 1, 0);
    if (!cart[id]) delete cart[id];
    this.recalcCart(cart);
  },

  onCheckout() {
    if (!this.data.cartCount) {
      wx.showToast({ title: "请先选择商品", icon: "none" });
      return;
    }
    const items = Object.keys(this.data.cart).map((id) => {
      const product = this.getProductById(id);
      return product ? { id, name: product.name, price: product.price, count: this.data.cart[id], image: product.image } : null;
    }).filter(Boolean);
    const draft = {
      merchant: {
        name: this.data.merchant.name,
        tag: this.data.merchant.tag,
        address: this.data.merchant.address,
        eta: this.data.merchant.eta,
      },
      items,
      totalAmount: this.data.cartAmount,
      pickupType: this.data.scene === "takeaway" ? "配送到寝" : "到店自取",
      sourceType: this.data.scene,
      createdAt: Date.now(),
    };
    wx.navigateTo({ url: `/pages/order/confirm?draft=${encodeURIComponent(JSON.stringify(draft))}` });
  },

  onBack() {
    wx.navigateBack();
  },
});
