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
    postId: "",
    post: null,
    commentInput: "",
  },

  onLoad(options = {}) {
    this.setData({ postId: options.id || "" });
    this.loadPost(options.id);
  },

  onShow() {
    if (this.data.postId) this.loadPost(this.data.postId);
  },

  async callCampusApi(data) {
    const res = await wx.cloud.callFunction({ name: "campusApi", data });
    if (!res.result || !res.result.success) {
      throw new Error((res.result && res.result.errMsg) || "云端请求失败");
    }
    return res.result.data;
  },

  formatTime(ts) {
    const d = new Date(Number(ts || Date.now()));
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },

  normalizeCloudPost(post, comments = []) {
    const price = Number(post.price || 0);
    return this.decoratePost({
      id: post._id,
      cloud: true,
      author: post.authorName || "校园用户",
      avatar: post.authorAvatar || "/images/avatar.png",
      tag: post.tagText || "求助",
      topic: post.topic || post.tagText || "校园墙",
      content: post.content || "",
      priceText: price > 0 ? `¥${price / 100}` : "",
      location: post.location || "崇明校区",
      images: Array.isArray(post.images) ? post.images : [],
      likes: Number(post.likeCount || 0),
      routeText: post.routeText || "",
      departTime: post.departTime || "",
      seats: post.seats ? `还剩 ${post.seats} 位` : "",
      eventTitle: post.eventTitle || "",
      eventTime: post.eventTime || "",
      comments: comments.map((comment) => ({
        id: comment._id,
        nickname: comment.authorName || "校园用户",
        content: comment.content,
      })),
      createdAt: post.createdAt,
      liked: false,
      collected: false,
    });
  },

  decoratePost(post) {
    const images = Array.isArray(post.images) ? post.images : [];
    const comments = Array.isArray(post.comments) ? post.comments : [];
    return {
      ...post,
      images,
      comments,
      commentCount: comments.length || post.commentCount || 0,
      timeText: this.formatTime(post.createdAt),
    };
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

  async loadPost(id) {
    if (!id) return;
    try {
      const post = await this.callCampusApi({ action: "getPost", id });
      const comments = await this.callCampusApi({ action: "listComments", postId: id });
      this.setData({ post: this.normalizeCloudPost(post, comments) });
    } catch (error) {
      console.warn("load cloud post fallback", error);
      const post = this.getAllPosts().find((item) => item.id === id);
      if (!post) {
        wx.showToast({ title: "帖子不存在", icon: "none" });
        return;
      }
      this.setData({ post: this.decoratePost(post) });
    }
  },

  updateLocalPost(updater) {
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

  async onLikeTap() {
    const post = this.data.post;
    if (!post) return;
    if (post.cloud) {
      try {
        await this.callCampusApi({ action: "toggleInteraction", targetType: "post", targetId: post.id, interactionType: "like" });
        this.loadPost(post.id);
      } catch (error) {
        wx.showToast({ title: "点赞失败", icon: "none" });
      }
      return;
    }
    this.updateLocalPost((item) => ({ ...item, liked: !item.liked, likes: Math.max(0, (item.likes || 0) + (item.liked ? -1 : 1)) }));
  },

  async onCollectTap() {
    const post = this.data.post;
    if (!post) return;
    if (post.cloud) {
      try {
        await this.callCampusApi({ action: "toggleInteraction", targetType: "post", targetId: post.id, interactionType: "favorite" });
        wx.showToast({ title: "已更新收藏" });
        this.loadPost(post.id);
      } catch (error) {
        wx.showToast({ title: "收藏失败", icon: "none" });
      }
      return;
    }
    this.updateLocalPost((item) => ({ ...item, collected: !item.collected }));
    wx.showToast({ title: "已更新收藏" });
  },

  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value || "" });
  },

  async onSubmitComment() {
    const post = this.data.post;
    const content = (this.data.commentInput || "").trim();
    if (!post || !content) return;
    if (post.cloud) {
      try {
        await this.callCampusApi({ action: "addComment", postId: post.id, content });
        this.setData({ commentInput: "" });
        this.loadPost(post.id);
      } catch (error) {
        wx.showToast({ title: "评论失败", icon: "none" });
      }
      return;
    }
    this.updateLocalPost((item) => ({
      ...item,
      comments: (item.comments || []).concat({ id: `comment_${Date.now()}`, nickname: "我", content }),
    }));
    this.setData({ commentInput: "" });
  },
});
