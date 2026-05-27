const FALLBACK_MENU = {
  scene: "campus",
  merchant: {
    id: "campus-cafe",
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
  ],
};

function callCampusApi(data) {
  return wx.cloud.callFunction({
    name: "campusApi",
    data,
  });
}

Page({
  data: {
    merchantId: "campus-cafe",
    scene: "campus",
    merchant: FALLBACK_MENU.merchant,
    categories: FALLBACK_MENU.categories,
    activeCategory: "热销",
    products: FALLBACK_MENU.products,
    visibleProducts: [],
    cart: {},
    cartCount: 0,
    cartAmount: 0,
  },

  onLoad(options = {}) {
    const id = options.id === "m1" || options.id === "r2" ? "takeaway-hot" : (options.id || "campus-cafe");
    this.setData({ merchantId: id }, () => this.loadMerchant(id));
  },

  async loadMerchant(id) {
    try {
      const result = await callCampusApi({ action: "getMerchant", merchantId: id });
      if (!result.result || !result.result.success || !result.result.data) {
        throw new Error((result.result && result.result.errMsg) || "get merchant failed");
      }
      const data = result.result.data;
      this.setData({
        scene: data.scene || data.merchant.sourceType || "campus",
        merchant: data.merchant,
        categories: data.categories,
        activeCategory: data.categories[0],
        products: data.products,
        cart: {},
        cartCount: 0,
        cartAmount: 0,
      }, () => this.applyCategory());
    } catch (err) {
      console.warn("load cloud merchant failed, use fallback", err);
      this.setData({
        scene: FALLBACK_MENU.scene,
        merchant: FALLBACK_MENU.merchant,
        categories: FALLBACK_MENU.categories,
        activeCategory: FALLBACK_MENU.categories[0],
        products: FALLBACK_MENU.products,
        cart: {},
        cartCount: 0,
        cartAmount: 0,
      }, () => this.applyCategory());
    }
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
    const deliveryFee = this.data.scene === "takeaway" ? Number(this.data.merchant.deliveryFee || 0) : 0;
    const draft = {
      merchantId: this.data.merchant.id || this.data.merchantId,
      merchant: {
        id: this.data.merchant.id || this.data.merchantId,
        name: this.data.merchant.name,
        tag: this.data.merchant.tag,
        address: this.data.merchant.address,
        eta: this.data.merchant.eta,
      },
      items,
      totalAmount: this.data.cartAmount + deliveryFee,
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
