const db = wx.cloud.database();
const _ = db.command;

const HOT_TOPICS = [
  { id: 1, title: "期末复习攻略来了", tag: "热", tagType: "hot" },
  { id: 2, title: "食堂新窗口排队实况", tag: "新", tagType: "new" },
  { id: 3, title: "社团招新火热进行中", tag: "荐", tagType: "rec" },
  { id: 4, title: "图书馆占座大战", tag: "", tagType: "" },
  { id: 5, title: "校园二手市集开张", tag: "热", tagType: "hot" },
  { id: 6, title: "羽毛球馆预约攻略", tag: "", tagType: "" },
  { id: 7, title: "校运会报名通道", tag: "新", tagType: "new" },
  { id: 8, title: "失物招领集中帖", tag: "", tagType: "" },
  { id: 9, title: "考研自习室推荐", tag: "荐", tagType: "rec" },
  { id: 10, title: "宿舍断电通知汇总", tag: "热", tagType: "hot" },
  { id: 11, title: "校园摄影大赛投稿", tag: "", tagType: "" },
  { id: 12, title: "兼职信息互助墙", tag: "新", tagType: "new" },
];

Page({
  data: {
    content: "",
    fileList: [],
    nickname: "",
    posts: [],
    loading: true,
    publishing: false,
    hotLeft: [],
    hotRight: [],
    hotAll: HOT_TOPICS,
    filterKeyword: "",
    allPosts: [],
    openid: "",
    commentInput: "",
    activePostId: "",
  },

  onLoad() {
    this.initHotTopics();
    this.fetchPosts();
    this.getOpenId();
  },

  getOpenId() {
    wx.cloud
      .callFunction({
        name: "quickstartFunctions",
        data: { type: "getOpenId" },
      })
      .then((res) => {
        if (res.result && res.result.openid) {
          this.setData({ openid: res.result.openid });
          // 获取到 openid 后重新格式化一次帖子列表，以显示点赞状态
          this.refreshPostsLikeStatus();
        }
      });
  },

  refreshPostsLikeStatus() {
    const { allPosts, openid } = this.data;
    if (!openid || !allPosts.length) return;

    const newAllPosts = allPosts.map((p) => ({
      ...p,
      isLiked: p.likedUsers && p.likedUsers.includes(openid),
    }));
    const posts = this.filterPostsByKeyword(newAllPosts, this.data.filterKeyword);
    this.setData({ allPosts: newAllPosts, posts });
  },

  onShow() {
    this.initNickname();
  },

  initNickname() {
    // 优先从全局数据或缓存读取登录用户信息
    const app = getApp();
    const userInfo = app.globalData.userInfo || wx.getStorageSync("userInfo");
    if (userInfo && userInfo.nickName) {
      this.setData({
        nickname: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl || "",
      });
    } else {
      this.setData({
        nickname: "未登录用户",
        avatarUrl: "",
      });
    }
  },

  formatTime(ts) {
    if (ts == null) return "";
    const d = typeof ts === "number" ? new Date(ts) : new Date(ts);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => (n < 10 ? "0" + n : "" + n);
    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      " " +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes())
    );
  },

  initHotTopics() {
    const list = HOT_TOPICS.slice();
    const hotLeft = [];
    const hotRight = [];
    list.forEach((item, index) => {
      if (index % 2 === 0) hotLeft.push(item);
      else hotRight.push(item);
    });
    this.setData({ hotLeft, hotRight });
  },

  filterPostsByKeyword(allPosts, keyword) {
    if (!keyword) return allPosts;
    const core = keyword.length > 4 ? keyword.slice(0, 4) : keyword;
    return allPosts.filter((p) => {
      const text = p.content || "";
      return text.indexOf(keyword) >= 0 || text.indexOf(core) >= 0;
    });
  },

  applyPostFilter(keyword) {
    const allPosts = this.data.allPosts || [];
    const posts = this.filterPostsByKeyword(allPosts, keyword);
    this.setData({ filterKeyword: keyword, posts });
  },

  onHotTap(e) {
    const title = e.currentTarget.dataset.title;
    if (!title) return;
    const next = this.data.filterKeyword === title ? "" : title;
    this.applyPostFilter(next);
    if (next) {
      wx.showToast({ title: "已筛选相关帖子", icon: "none" });
    }
  },

  onClearFilter() {
    this.applyPostFilter("");
  },

  onHotBriefTap() {
    wx.showToast({ title: "热搜简报开发中", icon: "none" });
  },

  onHotMoreTap() {
    const names = this.data.hotAll.map((item) => item.title).join("\n");
    wx.showModal({
      title: "更多校园热搜",
      content: names,
      showCancel: false,
      confirmText: "知道了",
    });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value || "" });
  },

  onChooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success: (res) => {
        const f = res.tempFiles && res.tempFiles[0];
        if (!f || !f.tempFilePath) return;
        this.setData({
          fileList: [{ url: f.tempFilePath, type: "image" }],
        });
      },
    });
  },

  onRemoveImage() {
    this.setData({ fileList: [] });
  },

  normalizePost(doc) {
    let ts = doc.timestamp;
    if (ts == null && doc.createdAt != null) {
      const c = doc.createdAt;
      if (typeof c === "number") ts = c;
      else if (c instanceof Date) ts = c.getTime();
      else if (typeof c === "object" && c.constructor && c.constructor.name === "Date") ts = new Date(c).getTime();
    }
    const nickname = doc.nickname || "校园用户";
    const likes = typeof doc.likes === "number" && !Number.isNaN(doc.likes) ? doc.likes : 0;
    const imageUrl = typeof doc.imageUrl === "string" && doc.imageUrl ? doc.imageUrl : "";
    const isLiked = doc.likedUsers && this.data.openid ? doc.likedUsers.includes(this.data.openid) : false;
    return {
      ...doc,
      displayName: nickname,
      avatarUrl: "",
      likes,
      imageUrl,
      isLiked,
      timeText: this.formatTime(ts),
    };
  },

  fetchPosts() {
    this.setData({ loading: true });
    db.collection("posts")
      .orderBy("timestamp", "desc")
      .limit(20)
      .get()
      .then((res) => {
        const allPosts = (res.data || []).map((doc) => this.normalizePost(doc));
        if (allPosts.length === 0) {
          this.setData({ allPosts: [], posts: [], loading: false });
          return;
        }

        // 批量获取这些帖子的评论
        const postIds = allPosts.map((p) => p._id);
        db.collection("comments")
          .where({
            postId: db.command.in(postIds),
          })
          .orderBy("timestamp", "asc")
          .get()
          .then((commentsRes) => {
            const allComments = commentsRes.data || [];

            // 将评论分配到各个帖子中
            const postsWithComments = allPosts.map((post) => {
              const postComments = allComments
                .filter((c) => c.postId === post._id)
                .map((c) => ({
                  ...c,
                  timeText: this.formatTime(c.timestamp),
                  isLiked: c.likedUsers && this.data.openid ? c.likedUsers.includes(this.data.openid) : false,
                }));
              return { ...post, comments: postComments };
            });

            const posts = this.filterPostsByKeyword(postsWithComments, this.data.filterKeyword);
            this.setData({ allPosts: postsWithComments, posts, loading: false });
          })
          .catch((err) => {
            // 如果是集合不存在的错误，给出明确提示
            if (err.errMsg && err.errMsg.includes("collection not exists")) {
              console.error("【架构师提示】请前往云开发控制台手动创建名为 comments 的数据库集合，并设置权限为'所有用户可读'");
            } else {
              console.error("加载评论发生其他错误:", err);
            }
            // 即使评论加载失败，也要保证帖子列表能显示出来
            const posts = this.filterPostsByKeyword(allPosts, this.data.filterKeyword);
            this.setData({ allPosts, posts, loading: false });
          });
      })
      .catch((err) => {
        console.error(err);
        this.setData({ loading: false });
        wx.showToast({ title: "加载失败", icon: "none" });
      });
  },

  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value });
  },

  onShowCommentInput(e) {
    const id = e.currentTarget.dataset.id;
    console.log("显示评论输入框，帖子ID:", id);
    if (!id) {
      console.error("未获取到帖子ID");
      return;
    }
    this.setData({ activePostId: id, commentInput: "" });
  },

  onHideCommentInput() {
    console.log("隐藏评论输入框");
    this.setData({ activePostId: "", commentInput: "" });
  },

  stopBubble() {
    // 仅用于阻止冒泡
  },

  onPublishComment() {
    const content = this.data.commentInput.trim();
    const postId = this.data.activePostId;
    if (!content) return;

    const nickname = this.data.nickname;
    if (!nickname || nickname === "未登录用户") {
      wx.showToast({ title: "请先登录", icon: "none" });
      wx.switchTab({ url: "/pages/mine/index" });
      return;
    }

    wx.showLoading({ title: "发布中" });
    wx.cloud
      .callFunction({
        name: "quickstartFunctions",
        data: {
          type: "addComment",
          postId,
          content,
          nickname,
        },
      })
      .then((res) => {
        wx.hideLoading();
        if (res.result && res.result.success) {
          wx.showToast({ title: "评论成功" });
          this.setData({ activePostId: "", commentInput: "" });
          this.fetchPosts();
        }
      })
      .catch((err) => {
        wx.hideLoading();
        console.error(err);
      });
  },

  onLikeCommentTap(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;

    wx.cloud
      .callFunction({
        name: "quickstartFunctions",
        data: {
          type: "likeComment",
          id: id,
        },
      })
      .then((res) => {
        if (res.result && res.result.success) {
          this.fetchPosts();
        }
      });
  },

  onDeleteCommentTap(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;

    wx.showModal({
      title: "提示",
      content: "确定要删除这条评论吗？",
      success: (res) => {
        if (res.confirm) {
          wx.cloud
            .callFunction({
              name: "quickstartFunctions",
              data: {
                type: "deleteComment",
                id: id,
              },
            })
            .then((res) => {
              if (res.result && res.result.success) {
                wx.showToast({ title: "已删除" });
                this.fetchPosts();
              } else {
                wx.showToast({ title: res.result.errMsg || "删除失败", icon: "none" });
              }
            });
        }
      },
    });
  },

  onPreviewImage(e) {
    const url = e.currentTarget.dataset.url;
    if (!url) return;
    wx.previewImage({
      current: url,
      urls: [url],
    });
  },

  onLikeTap(e) {
    const id = e.currentTarget.dataset.id;
    console.log("点击点赞/取消点赞，ID:", id);
    if (!id) return;

    wx.cloud
      .callFunction({
        name: "quickstartFunctions",
        data: {
          type: "likePost",
          id: id,
        },
      })
      .then((res) => {
        console.log("点赞返回:", res);
        if (res.result && res.result.success) {
          // 静默刷新，不再弹出提示
          this.fetchPosts();
        } else {
          const msg = res.result ? res.result.errMsg : "操作失败";
          wx.showModal({
            title: "提示",
            content: msg,
            showCancel: false,
          });
        }
      })
      .catch((err) => {
        console.error("点赞请求异常:", err);
      });
  },

  onDeleteTap(e) {
    const id = e.currentTarget.dataset.id;
    console.log("点击删除，ID:", id);
    if (!id) return;
    wx.showModal({
      title: "提示",
      content: "确定要删除这条帖子吗？",
      success: (res) => {
        if (!res.confirm) return;
        wx.cloud
          .callFunction({
            name: "quickstartFunctions",
            data: {
              type: "deletePost",
              id: id,
            },
          })
          .then((res) => {
            console.log("删除返回:", res);
            if (res.result && res.result.success) {
              wx.showToast({ title: "已删除", icon: "success" });
              this.fetchPosts();
            } else {
              const msg = res.result ? res.result.errMsg : "删除失败";
              wx.showModal({
                title: "提示",
                content: msg,
                showCancel: false,
              });
            }
          })
          .catch((err) => {
            console.error("删除请求异常:", err);
            wx.showModal({
              title: "错误",
              content: "云函数调用失败",
              showCancel: false,
            });
          });
      },
    });
  },

  buildCloudPath(localPath) {
    const m = typeof localPath === "string" ? localPath.match(/\.[a-zA-Z0-9]+$/) : null;
    const ext = m && m[0] ? m[0] : ".jpg";
    const rand = Math.random().toString(36).slice(2, 10);
    return `square/${Date.now()}_${rand}${ext}`;
  },

  addPostDoc(text, nickname, imageUrl) {
    const data = {
      content: text,
      timestamp: Date.now(),
      nickname,
      likes: 0,
    };
    if (imageUrl) {
      data.imageUrl = imageUrl;
    }
    return db.collection("posts").add({ data });
  },

  onPublish() {
    console.log("准备发布，当前内容:", this.data.content);
    if (this.data.publishing) return;
    const text = (this.data.content || "").trim();
    if (!text) {
      console.error("发布失败：内容为空");
      wx.showToast({ title: "请先输入内容", icon: "none" });
      return;
    }
    const nickname = this.data.nickname;
    if (!nickname || nickname === "未登录用户") {
      wx.showToast({ title: "请先登录", icon: "none" });
      wx.switchTab({ url: "/pages/mine/index" });
      return;
    }
    const fileList = this.data.fileList || [];
    const first = fileList[0];
    const localPath = first && (first.url || first.tempFilePath || first.path);
    const hasImage = !!localPath;

    this.setData({ publishing: true });

    const done = () => {
      wx.showToast({ title: "发布成功", icon: "success" });
      this.setData({
        content: "",
        fileList: [],
        publishing: false,
        filterKeyword: "",
      });
      this.fetchPosts();
    };

    const fail = (err) => {
      console.error("发布流程出错:", err);
      this.setData({ publishing: false });
      wx.showModal({
        title: "发布失败",
        content: err.message || "请检查网络或数据库权限",
        showCancel: false,
      });
    };

    if (hasImage) {
      const cloudPath = this.buildCloudPath(localPath);
      wx.cloud
        .uploadFile({
          cloudPath,
          filePath: localPath,
        })
        .then((up) => {
          console.log("图片上传成功:", up.fileID);
          return this.addPostDoc(text, nickname, up.fileID);
        })
        .then(done)
        .catch(fail);
    } else {
      this.addPostDoc(text, nickname, "")
        .then(done)
        .catch(fail);
    }
  },
});
