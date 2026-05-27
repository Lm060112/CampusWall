function callCampusApi(data) {
  return wx.cloud.callFunction({
    name: "campusApi",
    data,
  });
}

Page({
  data: {
    orderId: "",
    order: null,
    rating: 5,
    content: "",
    images: [],
    tags: ["服务及时", "味道不错", "包装完整", "沟通顺畅", "会再来"],
    selectedTags: [],
    selectedTagMap: {},
  },

  onLoad(options = {}) {
    this.setData({ orderId: options.id || "" });
    this.loadOrder();
  },

  async loadOrder() {
    try {
      const result = await callCampusApi({ action: "getOrder", orderId: this.data.orderId });
      if (!result.result || !result.result.success || !result.result.data) {
        throw new Error((result.result && result.result.errMsg) || "get order failed");
      }
      this.applyOrder(result.result.data, true);
    } catch (err) {
      console.warn("load cloud order failed, use local fallback", err);
      const order = (wx.getStorageSync("mockOrders") || []).find((item) => item.id === this.data.orderId || item._id === this.data.orderId);
      this.applyOrder(order || null, false);
    }
  },

  applyOrder(order, cloudSynced) {
    this.setData({ order: order ? { ...order, id: order._id || order.id, cloudSynced } : null });
    if (order && order.review) {
      const tags = order.review.tags || [];
      this.setData({
        rating: order.review.rating || 5,
        content: order.review.content || "",
        images: order.review.images || [],
        selectedTags: tags,
        selectedTagMap: this.buildTagMap(tags),
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

  onChooseImage() {
    const remain = 3 - this.data.images.length;
    if (remain <= 0) {
      wx.showToast({ title: "最多上传3张图片", icon: "none" });
      return;
    }
    wx.chooseMedia({
      count: remain,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success: (res) => {
        const picked = (res.tempFiles || []).map((item) => item.tempFilePath);
        this.setData({ images: this.data.images.concat(picked).slice(0, 3) });
      },
    });
  },

  onRemoveImage(e) {
    const index = Number(e.currentTarget.dataset.index);
    this.setData({ images: this.data.images.filter((_, itemIndex) => itemIndex !== index) });
  },

  saveLocalReview(review) {
    const orders = (wx.getStorageSync("mockOrders") || []).map((order) => (
      order.id === this.data.orderId || order._id === this.data.orderId
        ? { ...order, status: "completed", statusText: "订单已完成", review }
        : order
    ));
    wx.setStorageSync("mockOrders", orders);
  },

  async onSubmit() {
    if (!this.data.order) return;
    const review = {
      rating: this.data.rating,
      tags: this.data.selectedTags,
      content: this.data.content || "整体体验不错",
      images: this.data.images,
      createdAt: Date.now(),
    };
    try {
      const result = await callCampusApi({
        action: "submitOrderReview",
        orderId: this.data.order.id,
        review,
      });
      if (!result.result || !result.result.success) {
        throw new Error((result.result && result.result.errMsg) || "submit review failed");
      }
      wx.showToast({ title: "评价成功" });
    } catch (err) {
      console.warn("submit cloud review failed, use local fallback", err);
      this.saveLocalReview(review);
      wx.showToast({ title: "已本地评价", icon: "none" });
    }
    setTimeout(() => wx.navigateBack(), 700);
  },
});
