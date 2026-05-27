const STORAGE_KEY = "campus_discover_posts";

function callCampusApi(data) {
  return wx.cloud.callFunction({
    name: "campusApi",
    data,
  });
}

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

  normalizePost(post) {
    return {
      ...post,
      id: post._id || post.id,
      tag: post.tagText || post.tag || "动态",
      timeText: this.formatTime(post.createdAt),
      cover: post.images && post.images.length ? post.images[0] : "/images/default-goods-image.png",
      likes: post.likeCount || post.likes || 0,
      commentSize: post.commentCount || (post.comments ? post.comments.length : 0),
    };
  },

  async loadList() {
    try {
      const result = await callCampusApi({ action: "listMyPosts", mode: this.data.mode, pageSize: 100 });
      if (!result.result || !result.result.success) {
        throw new Error((result.result && result.result.errMsg) || "list my posts failed");
      }
      const list = ((result.result.data && result.result.data.list) || []).map((item) => this.normalizePost(item));
      this.setData({ list });
    } catch (err) {
      console.warn("load cloud my posts failed, use local fallback", err);
      const saved = wx.getStorageSync(STORAGE_KEY);
      const list = (Array.isArray(saved) ? saved : [])
        .filter((post) => (this.data.mode === "favorites" ? post.collected : post.isCustom))
        .map((post) => this.normalizePost(post));
      this.setData({ list });
    }
  },

  onBack() {
    wx.navigateBack();
  },

  onPostTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/discover/detail/index?id=${id}` });
  },

  async onRemoveTap(e) {
    const id = e.currentTarget.dataset.id;
    if (this.data.mode === "favorites") {
      try {
        await callCampusApi({ action: "toggleInteraction", targetType: "post", targetId: id, interactionType: "favorite" });
      } catch (err) {
        const posts = (wx.getStorageSync(STORAGE_KEY) || []).map((post) => (
          post.id === id ? { ...post, collected: false } : post
        ));
        wx.setStorageSync(STORAGE_KEY, posts);
      }
      this.loadList();
      return;
    }
    wx.showModal({
      title: "删除发布",
      content: "确定删除这条发布吗？",
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await callCampusApi({ action: "deletePost", id });
        } catch (err) {
          wx.setStorageSync(STORAGE_KEY, (wx.getStorageSync(STORAGE_KEY) || []).filter((post) => post.id !== id));
        }
        this.loadList();
      },
    });
  },
});
