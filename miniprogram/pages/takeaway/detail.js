const STORES = {
  t1: {
    merchant: {
      id: "t1",
      name: "沪上阿姨（校外店）",
      tag: "奶茶饮品",
      address: "崇明校区宿舍区门口 / 可备注楼栋",
      eta: "35分钟送达",
      rating: "4.8",
      deliveryFee: 200,
      coupons: ["满20减3", "第二杯半价"],
    },
    categories: ["热销", "奶茶", "果茶", "小料"],
    products: [
      { id: "t1p1", category: "热销", name: "葡萄奶绿", desc: "葡萄果肉，默认少冰", price: 1600, sales: "月售 86", image: "/images/default-goods-image.png" },
      { id: "t1p2", category: "热销", name: "芋泥波波奶茶", desc: "芋泥和波波双料", price: 1800, sales: "月售 72", image: "/images/default-goods-image.png" },
      { id: "t1p3", category: "奶茶", name: "经典珍珠奶茶", desc: "可选糖冰，默认正常糖", price: 1300, sales: "月售 64", image: "/images/default-goods-image.png" },
      { id: "t1p4", category: "果茶", name: "柠檬百香果", desc: "清爽酸甜，适合晚课后", price: 1500, sales: "月售 39", image: "/images/default-goods-image.png" },
      { id: "t1p5", category: "小料", name: "加珍珠", desc: "单份小料", price: 200, sales: "月售 120", image: "/images/default-goods-image.png" },
    ],
  },
  t2: {
    merchant: {
      id: "t2",
      name: "幸运咖啡",
      tag: "咖啡轻食",
      address: "崇明校区宿舍区门口 / 可备注楼栋",
      eta: "28分钟送达",
      rating: "4.7",
      deliveryFee: 300,
      coupons: ["折扣优惠", "新客立减"],
    },
    categories: ["热销", "咖啡", "轻食", "甜品"],
    products: [
      { id: "t2p1", category: "热销", name: "生椰拿铁", desc: "椰香浓郁，默认冰饮", price: 1800, sales: "月售 92", image: "/images/default-goods-image.png" },
      { id: "t2p2", category: "热销", name: "火腿芝士贝果", desc: "现烤贝果，适合早餐", price: 1500, sales: "月售 48", image: "/images/default-goods-image.png" },
      { id: "t2p3", category: "咖啡", name: "美式咖啡", desc: "冷热可选", price: 1200, sales: "月售 80", image: "/images/default-goods-image.png" },
      { id: "t2p4", category: "轻食", name: "鸡胸肉沙拉", desc: "低脂轻食套餐", price: 2200, sales: "月售 28", image: "/images/default-goods-image.png" },
      { id: "t2p5", category: "甜品", name: "巴斯克蛋糕", desc: "小份甜品", price: 1600, sales: "月售 31", image: "/images/default-goods-image.png" },
    ],
  },
  t3: {
    merchant: {
      id: "t3",
      name: "夜宵小馆",
      tag: "烧烤夜宵",
      address: "崇明校区宿舍区门口 / 可备注楼栋",
      eta: "45分钟送达",
      rating: "4.6",
      deliveryFee: 400,
      coupons: ["满35减6", "夜宵热卖"],
    },
    categories: ["热销", "烧烤", "主食", "饮品"],
    products: [
      { id: "t3p1", category: "热销", name: "鸡翅烤串套餐", desc: "鸡翅、烤肠、年糕组合", price: 2600, sales: "月售 75", image: "/images/default-goods-image.png" },
      { id: "t3p2", category: "热销", name: "冰粉", desc: "夜宵解辣搭配", price: 800, sales: "月售 66", image: "/images/default-goods-image.png" },
      { id: "t3p3", category: "烧烤", name: "牛肉串", desc: "一份 5 串", price: 1800, sales: "月售 58", image: "/images/default-goods-image.png" },
      { id: "t3p4", category: "主食", name: "炒方便面", desc: "夜宵经典主食", price: 1400, sales: "月售 44", image: "/images/default-goods-image.png" },
      { id: "t3p5", category: "饮品", name: "酸梅汤", desc: "冰镇瓶装", price: 600, sales: "月售 25", image: "/images/default-goods-image.png" },
    ],
  },
};

const SPEC_GROUPS = {
  drink: [
    { key: "temperature", title: "温度", options: ["正常冰", "少冰", "去冰", "热饮"] },
    { key: "sugar", title: "糖度", options: ["正常糖", "少糖", "半糖", "无糖"] },
    { key: "addon", title: "小料", options: ["不加料", "珍珠", "椰果", "芋圆"] },
  ],
  food: [
    { key: "taste", title: "口味", options: ["正常", "少辣", "微辣", "不辣"] },
    { key: "pack", title: "打包", options: ["正常打包", "多餐具", "不要餐具"] },
  ],
  default: [
    { key: "remark", title: "偏好", options: ["默认", "少辣", "打包", "不要餐具"] },
  ],
};

Page({
  data: {
    merchant: {},
    categories: [],
    activeCategory: "",
    products: [],
    visibleProducts: [],
    cart: {},
    cartItems: [],
    productCountMap: {},
    cartCount: 0,
    cartAmount: 0,
    cartOpen: false,
    specVisible: false,
    currentProduct: null,
    specGroups: [],
    selectedSpecs: {},
  },

  onLoad(options = {}) {
    const store = STORES[options.id] || STORES.t1;
    this.setData({
      merchant: store.merchant,
      categories: store.categories,
      activeCategory: store.categories[0],
      products: store.products,
    }, () => this.applyCategory());
  },

  applyCategory() {
    this.setData({
      visibleProducts: this.data.products.filter((item) => item.category === this.data.activeCategory),
    });
  },

  onCategoryTap(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.category }, () => this.applyCategory());
  },

  getProductById(id) {
    return this.data.products.find((item) => item.id === id);
  },

  getSpecGroups(product) {
    const text = `${this.data.merchant.tag || ""}${product.category || ""}${product.name || ""}`;
    if (/奶茶|果茶|咖啡|饮品|酸梅汤|冰粉/.test(text)) return SPEC_GROUPS.drink;
    if (/烧烤|主食|轻食|甜品|贝果|沙拉|套餐|炒|串/.test(text)) return SPEC_GROUPS.food;
    return SPEC_GROUPS.default;
  },

  getDefaultSpecs(groups) {
    return groups.reduce((acc, group) => {
      acc[group.key] = group.options[0];
      return acc;
    }, {});
  },

  getCartKey(product, specs) {
    const specPart = Object.keys(specs)
      .sort()
      .map((key) => `${key}:${specs[key]}`)
      .join("|");
    return `${product.id}__${specPart}`;
  },

  getSpecText(specs) {
    return Object.keys(specs).map((key) => specs[key]).join(" / ");
  },

  recalcCart(cart) {
    let cartCount = 0;
    let cartAmount = 0;
    const productCountMap = {};
    const cartItems = Object.keys(cart).map((key) => {
      const item = cart[key];
      if (!item || !item.count) return null;
      cartCount += item.count;
      cartAmount += item.price * item.count;
      productCountMap[item.productId] = (productCountMap[item.productId] || 0) + item.count;
      return item;
    }).filter(Boolean);
    this.setData({
      cart,
      cartItems,
      productCountMap,
      cartCount,
      cartAmount,
      cartOpen: cartCount ? this.data.cartOpen : false,
    });
  },

  onAdd(e) {
    const id = e.currentTarget.dataset.id;
    const product = this.getProductById(id);
    if (!product) return;
    const specGroups = this.getSpecGroups(product);
    this.setData({
      currentProduct: product,
      specGroups,
      selectedSpecs: this.getDefaultSpecs(specGroups),
      specVisible: true,
    });
  },

  onSpecTap(e) {
    const { key, value } = e.currentTarget.dataset;
    this.setData({ [`selectedSpecs.${key}`]: value });
  },

  onSpecClose() {
    this.setData({ specVisible: false, currentProduct: null });
  },

  onSpecConfirm() {
    const product = this.data.currentProduct;
    if (!product) return;
    const specs = { ...this.data.selectedSpecs };
    const key = this.getCartKey(product, specs);
    const cart = { ...this.data.cart };
    const existed = cart[key];
    cart[key] = {
      key,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      specs,
      specText: this.getSpecText(specs),
      count: existed ? existed.count + 1 : 1,
    };
    this.recalcCart(cart);
    this.onSpecClose();
  },

  onMinus(e) {
    const key = e.currentTarget.dataset.key;
    if (!key) return;
    const cart = { ...this.data.cart };
    if (!cart[key]) return;
    cart[key] = { ...cart[key], count: Math.max(cart[key].count - 1, 0) };
    if (!cart[key].count) delete cart[key];
    this.recalcCart(cart);
  },

  onProductMinus(e) {
    const id = e.currentTarget.dataset.id;
    const target = this.data.cartItems.find((item) => item.productId === id);
    if (!target) return;
    const cart = { ...this.data.cart };
    cart[target.key] = { ...cart[target.key], count: Math.max(cart[target.key].count - 1, 0) };
    if (!cart[target.key].count) delete cart[target.key];
    this.recalcCart(cart);
  },

  onCartItemAdd(e) {
    const key = e.currentTarget.dataset.key;
    const cart = { ...this.data.cart };
    if (!cart[key]) return;
    cart[key] = { ...cart[key], count: cart[key].count + 1 };
    this.recalcCart(cart);
  },

  onCartToggle() {
    if (!this.data.cartCount) return;
    this.setData({ cartOpen: !this.data.cartOpen });
  },

  onCartClose() {
    this.setData({ cartOpen: false });
  },

  onCartClear() {
    this.recalcCart({});
  },

  onCheckout() {
    if (!this.data.cartCount) {
      wx.showToast({ title: "请先选择商品", icon: "none" });
      return;
    }
    const items = this.data.cartItems.map((item) => ({
      id: item.key,
      productId: item.productId,
      name: item.name,
      specs: item.specs,
      specText: item.specText,
      price: item.price,
      count: item.count,
      image: item.image,
    }));
    const draft = {
      merchant: {
        name: this.data.merchant.name,
        tag: this.data.merchant.tag,
        address: this.data.merchant.address,
        eta: this.data.merchant.eta,
      },
      items,
      totalAmount: this.data.cartAmount + this.data.merchant.deliveryFee,
      pickupType: "校外配送",
      sourceType: "takeaway",
      createdAt: Date.now(),
    };
    wx.navigateTo({ url: `/pages/order/confirm?draft=${encodeURIComponent(JSON.stringify(draft))}` });
  },

  onBack() {
    wx.navigateBack();
  },
});
