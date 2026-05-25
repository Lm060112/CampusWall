Page({
  data: {
    orderId: "",
    order: null,
    rating: 5,
    content: "",
    tags: ["服务及时", "味道不错", "包装完整", "沟通顺畅", "会再来"],
    selectedTags: [],
    selectedTagMap: {},
  },

  onLoad(options = {}) {
    this.setData({ orderId: options.id || "" });
    this.loadOrder();
  },

  loadOrder() {
    const orders = wx.getStorageSync("mockOrders") || [];
    const order = orders.find((item) => item.id === this.data.orderId);
    this.setData({ order: order || null });
    if (order && order.review) {
      this.setData({
        rating: order.review.rating || 5,
        content: order.review.content || "",
        selectedTags: order.review.tags || [],
        selectedTagMap: this.buildTagMap(order.review.tags || []),
      });
    }
  },

  buildTagMap(tags) {
    return tags.reduce((acc, tag) => {
      acc[tag] = true;
      return acc;
    }, {});
  },

  onBack() {
    wx.navigateBack();
  },

  onStarTap(e) {
    this.setData({ rating: Number(e.currentTarget.dataset.value) });
  },

  onTagTap(e) {
    const tag = e.currentTarget.dataset.tag;
    const selectedTags = this.data.selectedTags.includes(tag)
      ? this.data.selectedTags.filter((item) => item !== tag)
      : this.data.selectedTags.concat(tag);
    this.setData({ selectedTags, selectedTagMap: this.buildTagMap(selectedTags) });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value || "" });
  },

  onSubmit() {
    if (!this.data.order) return;
    const review = {
      rating: this.data.rating,
      tags: this.data.selectedTags,
      content: this.data.content || "整体体验不错",
      createdAt: Date.now(),
    };
    const orders = (wx.getStorageSync("mockOrders") || []).map((order) => (
      order.id === this.data.orderId
        ? { ...order, status: "已完成", statusText: "订单已完成", review }
        : order
    ));
    wx.setStorageSync("mockOrders", orders);
    wx.showToast({ title: "评价成功" });
    setTimeout(() => wx.navigateBack(), 700);
  },
});
