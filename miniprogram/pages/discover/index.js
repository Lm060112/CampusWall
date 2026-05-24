const db = wx.cloud.database();

const TABS = ["推荐", "最新", "闲置", "求助", "拼车"];
const CATEGORY_OPTIONS = ["闲置", "求助", "拼车", "活动"];
const TAG_CLASS = {
  闲置: "idle",
  求助: "help",
  拼车: "carpool",
  活动: "activity",
  最新: "latest",
  推荐: "recommend",
};

Page({
  data: {
    tabs: TABS,
    categoryOptions: CATEGORY_OPTIONS,
    activeTab: "推荐",
    feedList: [],
    allPosts: [],
    loading: true,
    openid: "",
    nickname: "校园用户",

    showComposer: false,
    draftContent: "",
    draftCategory: "闲置",
    draftLocation: "崇明校区",
    draftImages: [],
    publishing: false,

    activePostId: "",
    commentInput: "",
  },

  onLoad() {
    this.initNickname();
    this.getOpenId();
    this.fetchPosts();
  },

  onShow() {
    this.initNickname();
  },

  initNickname() {
    const app = getApp();
    const userInfo = app.globalData.userInfo || wx.getStorageSync("userInfo");
    this.setData({
      nickname: userInfo && userInfo.nickName ? userInfo.nickName : "校园用户",
    });
  },

  getOpenId() {
    wx.cloud
      .callFunction({
        name: "quickstartFunctions",
        data: { type: "getOpenId" },
      })
      .then((res) => {
        const openid = res.result && res.result.openid;
        if (openid) {
          this.setData({ openid });
          this.refreshLikeAndDeleteState();
        }
      })
      .catch(() => {});
  },

  refreshLikeAndDeleteState() {
    const allPosts = (this.data.allPosts || []).map((post) => this.decoratePostState(post));
    this.setData({ allPosts }, () => this.applyFilter());
  },

  decoratePostState(post) {
    const openid = this.data.openid;
    return {
      ...post,
      isLiked: !!(openid && post.likedUsers && post.likedUsers.includes(openid)),
      canDelete: !!(openid && post._openid === openid),
      comments: (post.comments || []).map((comment) => ({
        ...comment,
        canDelete: !!(openid && comment._openid === openid),
      })),
    };
  },

  formatTime(ts) {
    const time = Number(ts || Date.now());
    const diff = Date.now() - time;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diff < minute) return "刚刚";
    if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
    if (diff < day) return `${Math.floor(diff / hour)}小时前`;
    return `${Math.floor(diff / day)}天前`;
  },

  normalizePost(doc, comments) {
    const category = doc.category || doc.tag || "最新";
    const images = Array.isArray(doc.images) && doc.images.length
      ? doc.images
      : doc.imageUrl
        ? [doc.imageUrl]
        : [];
    const postComments = comments || [];
    const normalized = {
      ...doc,
      id: doc._id,
      author: doc.nickname || doc.displayName || "校园用户",
      avatar: doc.avatarUrl || "/images/avatar.png",
      time: this.formatTime(doc.timestamp || doc.createdAt),
      topic: doc.topic || "校园生活",
      tag: category,
      tagClass: TAG_CLASS[category] || "latest",
      content: doc.content || "",
      priceText: doc.priceText || "",
      location: doc.location || "崇明校区",
      images,
      imageClass: images.length >= 3 ? "3" : images.length === 2 ? "2" : "1",
      likes: typeof doc.likes === "number" ? doc.likes : 0,
      commentCount: typeof doc.commentCount === "number" ? doc.commentCount : postComments.length,
      likedUsers: doc.likedUsers || [],
      comments: postComments.map((comment) => ({
        ...comment,
        time: this.formatTime(comment.timestamp || comment.createdAt),
      })),
    };
    return this.decoratePostState(normalized);
  },

  fetchPosts() {
    this.setData({ loading: true });
    db.collection("posts")
      .orderBy("timestamp", "desc")
      .limit(30)
      .get()
      .then((res) => {
        const docs = res.data || [];
        if (!docs.length) {
          this.setData({ allPosts: [], feedList: [], loading: false });
          return;
        }

        const ids = docs.map((item) => item._id);
        db.collection("comments")
          .where({ postId: db.command.in(ids) })
          .orderBy("timestamp", "asc")
          .get()
          .then((commentRes) => {
            const comments = commentRes.data || [];
            const posts = docs.map((doc) => {
              const postComments = comments.filter((item) => item.postId === doc._id);
              return this.normalizePost(doc, postComments);
            });
            this.setData({ allPosts: posts, loading: false }, () => this.applyFilter());
          })
          .catch(() => {
            const posts = docs.map((doc) => this.normalizePost(doc, []));
            this.setData({ allPosts: posts, loading: false }, () => this.applyFilter());
          });
      })
      .catch((err) => {
        console.error(err);
        this.setData({ loading: false });
        wx.showToast({ title: "加载失败，请检查云数据库", icon: "none" });
      });
  },

  applyFilter() {
    const activeTab = this.data.activeTab;
    let feedList = this.data.allPosts || [];
    if (activeTab !== "推荐" && activeTab !== "最新") {
      feedList = feedList.filter((post) => post.tag === activeTab);
    }
    this.setData({ feedList });
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab }, () => this.applyFilter());
  },

  onSearchTap() {
    wx.showToast({ title: "搜索帖子待接入", icon: "none" });
  },

  onScanTap() {
    wx.showToast({ title: "扫码入口待接入", icon: "none" });
  },

  onPublishTap() {
    this.setData({ showComposer: true });
  },

  onCloseComposer() {
    if (this.data.publishing) return;
    this.setData({ showComposer: false });
  },

  onDraftInput(e) {
    this.setData({ draftContent: e.detail.value || "" });
  },

  onLocationInput(e) {
    this.setData({ draftLocation: e.detail.value || "" });
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
        this.setData({
          draftImages: this.data.draftImages.concat(picked).slice(0, 3),
        });
      },
    });
  },

  onRemoveDraftImage(e) {
    const index = e.currentTarget.dataset.index;
    const draftImages = this.data.draftImages.filter((_, i) => i !== index);
    this.setData({ draftImages });
  },

  buildCloudPath(localPath) {
    const extMatch = typeof localPath === "string" ? localPath.match(/\.[a-zA-Z0-9]+$/) : null;
    const ext = extMatch ? extMatch[0] : ".jpg";
    return `posts/${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
  },

  uploadDraftImages() {
    const files = this.data.draftImages || [];
    return files.reduce((promise, file) => {
      return promise.then((list) => {
        return wx.cloud
          .uploadFile({
            cloudPath: this.buildCloudPath(file.url),
            filePath: file.url,
          })
          .then((res) => list.concat(res.fileID));
      });
    }, Promise.resolve([]));
  },

  onSubmitPost() {
    const content = (this.data.draftContent || "").trim();
    if (!content) {
      wx.showToast({ title: "请输入发布内容", icon: "none" });
      return;
    }
    if (this.data.publishing) return;

    this.setData({ publishing: true });
    wx.showLoading({ title: "发布中" });
    this.uploadDraftImages()
      .then((images) => {
        return db.collection("posts").add({
          data: {
            content,
            category: this.data.draftCategory,
            location: this.data.draftLocation || "崇明校区",
            images,
            imageUrl: images[0] || "",
            nickname: this.data.nickname || "校园用户",
            topic: "校园生活",
            timestamp: Date.now(),
            likes: 0,
            likedUsers: [],
            commentCount: 0,
          },
        });
      })
      .then(() => {
        wx.hideLoading();
        wx.showToast({ title: "发布成功" });
        this.setData({
          showComposer: false,
          draftContent: "",
          draftLocation: "崇明校区",
          draftCategory: "闲置",
          draftImages: [],
          publishing: false,
          activeTab: "最新",
        });
        this.fetchPosts();
      })
      .catch((err) => {
        wx.hideLoading();
        console.error(err);
        this.setData({ publishing: false });
        wx.showToast({ title: "发布失败", icon: "none" });
      });
  },

  onLikeTap(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.cloud
      .callFunction({
        name: "quickstartFunctions",
        data: { type: "likePost", id },
      })
      .then((res) => {
        if (res.result && res.result.success) this.fetchPosts();
        else wx.showToast({ title: "操作失败", icon: "none" });
      })
      .catch(() => wx.showToast({ title: "操作失败", icon: "none" }));
  },

  onShowCommentInput(e) {
    this.setData({
      activePostId: e.currentTarget.dataset.id,
      commentInput: "",
    });
  },

  onHideCommentInput() {
    this.setData({ activePostId: "", commentInput: "" });
  },

  stopBubble() {},

  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value || "" });
  },

  onSubmitComment() {
    const content = (this.data.commentInput || "").trim();
    if (!content || !this.data.activePostId) return;
    wx.cloud
      .callFunction({
        name: "quickstartFunctions",
        data: {
          type: "addComment",
          postId: this.data.activePostId,
          content,
          nickname: this.data.nickname || "校园用户",
        },
      })
      .then((res) => {
        if (res.result && res.result.success) {
          this.setData({ activePostId: "", commentInput: "" });
          this.fetchPosts();
        } else {
          wx.showToast({ title: "评论失败", icon: "none" });
        }
      })
      .catch(() => wx.showToast({ title: "评论失败", icon: "none" }));
  },

  onDeletePost(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "删除帖子",
      content: "确定删除这条帖子吗？",
      success: (res) => {
        if (!res.confirm) return;
        wx.cloud
          .callFunction({
            name: "quickstartFunctions",
            data: { type: "deletePost", id },
          })
          .then((result) => {
            if (result.result && result.result.success) {
              wx.showToast({ title: "已删除" });
              this.fetchPosts();
            } else {
              wx.showToast({ title: result.result.errMsg || "删除失败", icon: "none" });
            }
          });
      },
    });
  },

  onDeleteComment(e) {
    const id = e.currentTarget.dataset.id;
    wx.cloud
      .callFunction({
        name: "quickstartFunctions",
        data: { type: "deleteComment", id },
      })
      .then((res) => {
        if (res.result && res.result.success) this.fetchPosts();
        else wx.showToast({ title: "删除失败", icon: "none" });
      });
  },
});
