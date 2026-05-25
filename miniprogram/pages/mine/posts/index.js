const STORAGE_KEY = "campus_discover_posts";

Page({
  data: {
    mode: "published",
    title: "我的发布",
    list: [],
    emptyText: "还没有发布内容",
  },

  onLoad(options = {}) {
    const mode = options.mode === "favorites" ? "favorites" : "published";
    this.setData({
      mode,
      title: mode === "favorites" ? "我的收藏" : "我的发布",
      emptyText: mode === "favorites" ? "还没有收藏内容" : "还没有发布内容",
    });
    this.loadList();
  },

  onShow() {
    this.loadList();
  },

  formatTime(ts) {
    const diff = Date.now() - Number(ts || Date.now());
    const minute = 60 * 1000;
    const hour = 60 * minute;
    if (diff < minute) return "刚刚";
    if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
    if (diff < 24 * hour) return `${Math.floor(diff / hour)}小时前`;
    const d = new Date(Number(ts));
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  },

  getCustomPosts() {
    const saved = wx.getStorageSync(STORAGE_KEY);
    return Array.isArray(saved) ? saved : [];
  },

  saveCustomPosts(posts) {
    wx.setStorageSync(STORAGE_KEY, posts);
  },

  loadList() {
    const posts = this.getCustomPosts()
      .filter((post) => (this.data.mode === "favorites" ? post.collected : post.isCustom))
      .map((post) => ({
        ...post,
        timeText: this.formatTime(post.createdAt),
        cover: post.images && post.images.length ? post.images[0] : "/images/default-goods-image.png",
      }));
    this.setData({ list: posts });
  },

  onBack() {
    wx.navigateBack();
  },

  onPostTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/discover/detail/index?id=${id}` });
  },

  onRemoveTap(e) {
    const id = e.currentTarget.dataset.id;
    if (this.data.mode === "favorites") {
      const posts = this.getCustomPosts().map((post) => (
        post.id === id ? { ...post, collected: false } : post
      ));
      this.saveCustomPosts(posts);
      this.loadList();
      return;
    }
    wx.showModal({
      title: "删除发布",
      content: "确定删除这条发布吗？",
      success: (res) => {
        if (!res.confirm) return;
        this.saveCustomPosts(this.getCustomPosts().filter((post) => post.id !== id));
        this.loadList();
      },
    });
  },
});
