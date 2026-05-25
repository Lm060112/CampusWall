const STORAGE_KEY = "campus_discover_posts";

const TABS = ["推荐", "最新", "闲置", "求助", "拼车", "活动"];
const CATEGORY_OPTIONS = ["闲置", "求助", "拼车", "活动"];
const TAG_CLASS = {
  闲置: "idle",
  求助: "help",
  拼车: "carpool",
  活动: "activity",
  最新: "latest",
  推荐: "recommend",
};

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
    commentCount: 2,
    comments: [
      { id: "c_1", nickname: "阿呆同学", content: "还在吗？可以自提。" },
      { id: "c_2", nickname: "橙子", content: "想看一下耳机盒细节。" },
    ],
    createdAt: Date.now() - 10 * 60 * 1000,
    liked: false,
    collected: false,
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
    commentCount: 3,
    comments: [{ id: "c_3", nickname: "周小北", content: "帮顶，已经转发班群。" }],
    createdAt: Date.now() - 65 * 60 * 1000,
    liked: false,
    collected: false,
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
    commentCount: 7,
    comments: [],
    createdAt: Date.now() - 3 * 60 * 60 * 1000,
    liked: true,
    collected: false,
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
    commentCount: 1,
    comments: [],
    createdAt: Date.now() - 5 * 60 * 60 * 1000,
    liked: false,
    collected: false,
  },
];

Page({
  data: {
    tabs: TABS,
    categoryOptions: CATEGORY_OPTIONS,
    activeTab: "推荐",
    searchKeyword: "",
    feedList: [],
    allPosts: [],
    emptyText: "暂无内容，来发布第一条吧",

    showComposer: false,
    draftTitle: "",
    draftContent: "",
    draftCategory: "闲置",
    draftLocation: "崇明校区",
    draftPrice: "",
    draftEventTime: "",
    draftImages: [],
    publishing: false,

    activePostId: "",
    commentInput: "",
  },

  onLoad() {
    this.loadPosts();
  },

  onShow() {
    this.loadPosts();
  },

  loadPosts() {
    const saved = wx.getStorageSync(STORAGE_KEY);
    const customPosts = Array.isArray(saved) ? saved : [];
    const savedIds = customPosts.map((post) => post.id);
    const allPosts = customPosts
      .concat(MOCK_POSTS.filter((post) => !savedIds.includes(post.id)))
      .map((post) => this.decoratePost(post));
    this.setData({ allPosts }, () => this.applyFilter());
  },

  saveCustomPosts(posts) {
    wx.setStorageSync(STORAGE_KEY, posts);
  },

  formatTime(ts) {
    const diff = Date.now() - Number(ts || Date.now());
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diff < minute) return "刚刚";
    if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
    if (diff < day) return `${Math.floor(diff / hour)}小时前`;
    return `${Math.floor(diff / day)}天前`;
  },

  decoratePost(post) {
    const images = Array.isArray(post.images) ? post.images : [];
    return {
      ...post,
      tagClass: TAG_CLASS[post.tag] || "latest",
      timeText: this.formatTime(post.createdAt),
      imageClass: images.length >= 3 ? "3" : images.length === 2 ? "2" : "1",
      commentCount: Array.isArray(post.comments) ? post.comments.length : post.commentCount || 0,
      comments: Array.isArray(post.comments) ? post.comments : [],
    };
  },

  applyFilter() {
    const keyword = (this.data.searchKeyword || "").trim().toLowerCase();
    let feedList = this.data.allPosts || [];
    if (this.data.activeTab !== "推荐" && this.data.activeTab !== "最新") {
      feedList = feedList.filter((post) => post.tag === this.data.activeTab);
    }
    if (keyword) {
      feedList = feedList.filter((post) => {
        const text = `${post.author}${post.tag}${post.topic}${post.content}${post.location}`.toLowerCase();
        return text.includes(keyword);
      });
    }
    if (this.data.activeTab === "最新") {
      feedList = feedList.slice().sort((a, b) => b.createdAt - a.createdAt);
    }
    this.setData({
      feedList,
      emptyText: keyword ? "没有找到相关内容" : "暂无内容，来发布第一条吧",
    });
  },

  updatePost(id, updater) {
    const allPosts = this.data.allPosts.map((post) => (post.id === id ? this.decoratePost(updater(post)) : post));
    const customPosts = allPosts.filter((post) => post.isCustom || post.liked || post.collected || (post.comments && post.comments.length));
    this.saveCustomPosts(customPosts);
    this.setData({ allPosts }, () => this.applyFilter());
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab }, () => this.applyFilter());
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value || "" }, () => this.applyFilter());
  },

  onClearSearch() {
    this.setData({ searchKeyword: "" }, () => this.applyFilter());
  },

  onScanTap() {
    wx.showToast({ title: "扫码入口待接入", icon: "none" });
  },

  onPostTap(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({ url: `/pages/discover/detail/index?id=${id}` });
  },

  onPublishTap() {
    this.setData({ showComposer: true });
  },

  onCloseComposer() {
    if (this.data.publishing) return;
    this.setData({ showComposer: false });
  },

  stopBubble() {},

  onDraftTitleInput(e) {
    this.setData({ draftTitle: e.detail.value || "" });
  },

  onDraftInput(e) {
    this.setData({ draftContent: e.detail.value || "" });
  },

  onLocationInput(e) {
    this.setData({ draftLocation: e.detail.value || "" });
  },

  onPriceInput(e) {
    this.setData({ draftPrice: e.detail.value || "" });
  },

  onEventTimeInput(e) {
    this.setData({ draftEventTime: e.detail.value || "" });
  },

  onCategoryTap(e) {
    this.setData({ draftCategory: e.currentTarget.dataset.category });
  },

  onChooseImage() {
    wx.chooseMedia({
      count: Math.max(1, 3 - this.data.draftImages.length),
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success: (res) => {
        const picked = (res.tempFiles || [])
          .map((item) => item.tempFilePath)
          .filter(Boolean)
          .map((url) => ({ url }));
        this.setData({ draftImages: this.data.draftImages.concat(picked).slice(0, 3) });
      },
    });
  },

  onRemoveDraftImage(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ draftImages: this.data.draftImages.filter((_, i) => i !== index) });
  },

  onSubmitPost() {
    const title = (this.data.draftTitle || "").trim();
    const content = (this.data.draftContent || "").trim();
    if (!content) {
      wx.showToast({ title: "请输入发布内容", icon: "none" });
      return;
    }
    const post = this.decoratePost({
      id: `local_${Date.now()}`,
      isCustom: true,
      author: "校园用户",
      avatar: "/images/avatar.png",
      tag: this.data.draftCategory,
      topic: title || this.data.draftCategory,
      content,
      priceText: this.data.draftCategory === "闲置" && this.data.draftPrice ? `¥${this.data.draftPrice}` : "",
      location: this.data.draftLocation || "崇明校区",
      eventTitle: this.data.draftCategory === "活动" ? title || "校园活动" : "",
      eventTime: this.data.draftCategory === "活动" ? this.data.draftEventTime : "",
      images: this.data.draftImages.map((item) => item.url),
      likes: 0,
      comments: [],
      createdAt: Date.now(),
      liked: false,
      collected: false,
    });
    const customPosts = [post].concat((wx.getStorageSync(STORAGE_KEY) || []).filter(Boolean));
    this.saveCustomPosts(customPosts);
    wx.showToast({ title: "发布成功" });
    this.setData({
      showComposer: false,
      activeTab: "最新",
      draftTitle: "",
      draftContent: "",
      draftCategory: "闲置",
      draftLocation: "崇明校区",
      draftPrice: "",
      draftEventTime: "",
      draftImages: [],
    });
    this.loadPosts();
  },

  onLikeTap(e) {
    const id = e.currentTarget.dataset.id;
    this.updatePost(id, (post) => ({
      ...post,
      liked: !post.liked,
      likes: Math.max(0, (post.likes || 0) + (post.liked ? -1 : 1)),
    }));
  },

  onCollectTap(e) {
    const id = e.currentTarget.dataset.id;
    this.updatePost(id, (post) => ({ ...post, collected: !post.collected }));
    wx.showToast({ title: "已更新收藏" });
  },

  onPreviewImage(e) {
    const { src, id } = e.currentTarget.dataset;
    const post = this.data.allPosts.find((item) => item.id === id);
    if (!post || !post.images.length) return;
    wx.previewImage({ current: src, urls: post.images });
  },

  onShowCommentInput(e) {
    this.setData({ activePostId: e.currentTarget.dataset.id, commentInput: "" });
  },

  onHideCommentInput() {
    this.setData({ activePostId: "", commentInput: "" });
  },

  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value || "" });
  },

  onSubmitComment() {
    const content = (this.data.commentInput || "").trim();
    const id = this.data.activePostId;
    if (!content || !id) return;
    this.updatePost(id, (post) => ({
      ...post,
      comments: (post.comments || []).concat({
        id: `comment_${Date.now()}`,
        nickname: "我",
        content,
      }),
    }));
    this.setData({ activePostId: "", commentInput: "" });
  },

  onDeletePost(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "删除帖子",
      content: "确定删除这条本地发布吗？",
      success: (res) => {
        if (!res.confirm) return;
        const customPosts = (wx.getStorageSync(STORAGE_KEY) || []).filter((post) => post.id !== id);
        this.saveCustomPosts(customPosts);
        this.loadPosts();
      },
    });
  },
});
