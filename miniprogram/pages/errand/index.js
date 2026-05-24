const TYPES = [
  { key: "express", title: "取快递", icon: "logistics", example: "菜鸟驿站取件" },
  { key: "buy", title: "代买", icon: "cart-o", example: "便利店代买" },
  { key: "send", title: "代送", icon: "guide-o", example: "文件送到教学楼" },
  { key: "print", title: "打印取件", icon: "description-o", example: "打印店取资料" },
];

Page({
  data: {
    types: TYPES,
    activeType: "express",
    fromText: "校门口快递点",
    toText: "崇明校区宿舍区",
    detail: "",
    reward: "5",
  },

  onTypeTap(e) {
    this.setData({ activeType: e.currentTarget.dataset.key });
  },

  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value });
  },

  onSubmit() {
    const type = TYPES.find((item) => item.key === this.data.activeType) || TYPES[0];
    const reward = Math.max(Number(this.data.reward) || 0, 1);
    const desc = this.data.detail || type.example;
    const draft = {
      merchant: {
        name: `跑腿代取 · ${type.title}`,
        tag: "校园跑腿",
        address: `${this.data.fromText} → ${this.data.toText}`,
        eta: "预计30分钟内完成",
      },
      items: [
        {
          id: `errand-${type.key}`,
          name: desc,
          price: reward * 100,
          count: 1,
          image: "/images/default-goods-image.png",
        },
      ],
      totalAmount: reward * 100,
      pickupType: "跑腿代取",
      sourceType: "errand",
      createdAt: Date.now(),
    };
    wx.navigateTo({ url: `/pages/order/confirm?draft=${encodeURIComponent(JSON.stringify(draft))}` });
  },

  onBack() {
    wx.navigateBack();
  },
});
