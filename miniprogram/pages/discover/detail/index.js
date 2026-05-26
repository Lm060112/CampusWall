const STORAGE_KEY = "campus_discover_posts";

const FALLBACK_POSTS = [
  {
    id: "mock_1",
    author: "小椰子",
    avatar: "/images/avatar.png",
    tag: "闲置",
    topic: "大学生活",
    content: "出九成新蓝牙耳机，使用不到一个月，音质不错，原价199，现价80出，感兴趣滴滴～",
    priceText: "¥80",
    location: "崇明校区 ｜ 第三教学楼",
    images: ["/images/default-goods-image.png", "/images/ai_example1.png", "/images/ai_example2.png"],
    likes: 26,
    comments: [{ id: "c_1", nickname: "阿呜同学", content: "还在吗？可以自提。" }],
    createdAt: Date.now() - 10 * 60 * 1000,
  },
  {
    id: "mock_3",
    author: "阿呜学姐",
    avatar: "/images/avatar.png",
    tag: "活动",
    topic: "活动分享",
    content: "周六下午羽毛球友谊赛来啦，新手友好，赢了有小礼品，感兴趣的同学快来报名。",
    location: "体育馆二楼羽毛球馆",
    eventTitle: "周六羽毛球友谊赛",
    eventTime: "05-31（周六）14:00-17:00",
    images: [],
    likes: 31,
    comments: [],
    createdAt: Date.now() - 3 * 60 * 60 * 1000,
  },
];

Page({
  data: {
    post: null,
    commentInput: "",
  },

  onLoad(options = {}) {
    this.loadPost(options.id);
  },

  onShow() {
    if (this.data.post && this.data.post.id) this.loadPost(this.data.post.id);
  },

  formatTime(ts) {
    const d = new Date(Number(ts || Date.now()));
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },

  decoratePost(post) {
    const images = Array.isArray(post.images) ? post.images : [];
    const comments = Array.isArray(post.comments) ? post.comments : [];
    return { ...post, images, comments, commentCount: comments.length, timeText: this.formatTime(post.createdAt) };
  },

  getAllPosts() {
    const saved = wx.getStorageSync(STORAGE_KEY);
    const customPosts = Array.isArray(saved) ? saved : [];
    const savedIds = customPosts.map((post) => post.id);
    return customPosts.concat(FALLBACK_POSTS.filter((post) => !savedIds.includes(post.id)));
  },

  saveCustomPosts(posts) {
    wx.setStorageSync(STORAGE_KEY, posts);
  },

  loadPost(id) {
    const post = this.getAllPosts().find((item) => item.id === id);
    if (!post) {
      wx.showToast({ title: "帖子不存在", icon: "none" });
      return;
    }
    this.setData({ post: this.decoratePost(post) });
  },

  updatePost(updater) {
    const post = this.data.post;
    if (!post) return;
    const nextAllPosts = this.getAllPosts().map((item) => (item.id === post.id ? updater(item) : item));
    this.saveCustomPosts(nextAllPosts.filter((item) => item.isCustom || item.liked || item.collected || (item.comments && item.comments.length)));
    this.setData({ post: this.decoratePost(nextAllPosts.find((item) => item.id === post.id)) });
  },

  onBack() {
    wx.navigateBack();
  },

  onPreviewImage(e) {
    const src = e.currentTarget.dataset.src;
    if (this.data.post && this.data.post.images.length) wx.previewImage({ current: src, urls: this.data.post.images });
  },

  onLikeTap() {
    this.updatePost((post) => ({ ...post, liked: !post.liked, likes: Math.max(0, (post.likes || 0) + (post.liked ? -1 : 1)) }));
  },

  onCollectTap() {
    this.updatePost((post) => ({ ...post, collected: !post.collected }));
    wx.showToast({ title: "已更新收藏" });
  },

  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value || "" });
  },

  onSubmitComment() {
    const content = (this.data.commentInput || "").trim();
    if (!content) return;
    this.updatePost((post) => ({
      ...post,
      comments: (post.comments || []).concat({ id: `comment_${Date.now()}`, nickname: "我", content }),
    }));
    this.setData({ commentInput: "" });
  },
});
