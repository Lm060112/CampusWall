const STORAGE_KEY = "campus_discover_posts";

const MOCK_POSTS = [
  {
    id: "mock_1",
    author: "小椰子",
    avatar: "/images/avatar.png",
    tag: "闲置",
    topic: "大学生活",
    content: "出九成新蓝牙耳机，使用不到一个月，音质挺好，原价199，现价80出，感兴趣滴滴。",
    priceText: "¥80",
    location: "崇明校区 · 第三教学楼",
    images: ["/images/default-goods-image.png", "/images/ai_example1.png", "/images/ai_example2.png"],
    likes: 26,
    comments: [
      { id: "c_1", nickname: "阿呆同学", content: "还在吗？可以自提。" },
      { id: "c_2", nickname: "橙子", content: "想看一下耳机盒细节。" },
    ],
    createdAt: Date.now() - 10 * 60 * 1000,
  },
  {
    id: "mock_2",
    author: "奶盖不加糖",
    avatar: "/images/avatar.png",
    tag: "求助",
    topic: "失物招领",
    content: "今天中午在食堂二楼捡到一张校园卡，麻烦失主来一食堂服务台认领。",
    location: "崇明校区 · 一食堂",
    images: ["/images/database.png"],
    likes: 14,
    comments: [{ id: "c_3", nickname: "周小北", content: "帮顶，已经转发班群。" }],
    createdAt: Date.now() - 65 * 60 * 1000,
  },
  {
    id: "mock_3",
    author: "阿呆学姐",
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
  {
    id: "mock_4",
    author: "跑步的小陈",
    avatar: "/images/avatar.png",
    tag: "拼车",
    topic: "拼车",
    content: "明天早上 8:30 崇明校区到市区人民广场附近，有顺路的小伙伴吗？",
    location: "崇明校区正门",
    images: [],
    likes: 9,
    comments: [],
    createdAt: Date.now() - 5 * 60 * 60 * 1000,
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
    return {
      ...post,
      timeText: this.formatTime(post.createdAt),
      images,
      comments: Array.isArray(post.comments) ? post.comments : [],
      commentCount: Array.isArray(post.comments) ? post.comments.length : 0,
    };
  },

  getAllPosts() {
    const saved = wx.getStorageSync(STORAGE_KEY);
    const customPosts = Array.isArray(saved) ? saved : [];
    const savedIds = customPosts.map((post) => post.id);
    return customPosts.concat(MOCK_POSTS.filter((post) => !savedIds.includes(post.id)));
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
    const allPosts = this.getAllPosts();
    const nextAllPosts = allPosts.map((item) => (item.id === post.id ? updater(item) : item));
    this.saveCustomPosts(nextAllPosts.filter((item) => item.isCustom || item.liked || item.collected || (item.comments && item.comments.length)));
    const nextPost = nextAllPosts.find((item) => item.id === post.id);
    this.setData({ post: this.decoratePost(nextPost) });
  },

  onBack() {
    wx.navigateBack();
  },

  onPreviewImage(e) {
    const src = e.currentTarget.dataset.src;
    if (!this.data.post || !this.data.post.images.length) return;
    wx.previewImage({ current: src, urls: this.data.post.images });
  },

  onLikeTap() {
    this.updatePost((post) => ({
      ...post,
      liked: !post.liked,
      likes: Math.max(0, (post.likes || 0) + (post.liked ? -1 : 1)),
    }));
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
      comments: (post.comments || []).concat({
        id: `comment_${Date.now()}`,
        nickname: "我",
        content,
      }),
    }));
    this.setData({ commentInput: "" });
  },
});
