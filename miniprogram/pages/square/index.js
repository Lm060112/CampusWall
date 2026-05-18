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
    anonymousPost: false,
    posts: [],
    loading: true,
    publishing: false,
    hotLeft: [],
    hotRight: [],
    hotAll: HOT_TOPICS,
    filterKeyword: "",
    allPosts: [],
  },

  onLoad() {
    this.initHotTopics();
    this.fetchPosts();
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

  onToggleAnonymous() {
    const next = !this.data.anonymousPost;
    this.setData({ anonymousPost: next });
    wx.showToast({
      title: next ? "已开启匿名" : "已关闭匿名",
      icon: "none",
    });
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

  normalizePost(doc) {
    let ts = doc.timestamp;
    if (ts == null && doc.createdAt != null) {
      const c = doc.createdAt;
      if (typeof c === "number") ts = c;
      else if (c instanceof Date) ts = c.getTime();
      else if (typeof c === "object" && c.constructor && c.constructor.name === "Date") ts = new Date(c).getTime();
    }
    const isAnonymous = doc.is_anonymous === true;
    const likes = typeof doc.likes === "number" && !Number.isNaN(doc.likes) ? doc.likes : 0;
    const imageUrl = typeof doc.imageUrl === "string" && doc.imageUrl ? doc.imageUrl : "";
    return {
      ...doc,
      is_anonymous: isAnonymous,
      displayName: isAnonymous ? "匿名同学" : "实名用户",
      avatarUrl: "",
      likes,
      imageUrl,
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
        const posts = this.filterPostsByKeyword(allPosts, this.data.filterKeyword);
        this.setData({ allPosts, posts, loading: false });
      })
      .catch((err) => {
        console.error(err);
        this.setData({ loading: false });
        wx.showToast({ title: "加载失败", icon: "none" });
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
    if (!id) return;
    db.collection("posts")
      .doc(id)
      .update({
        data: {
          likes: _.inc(1),
        },
      })
      .then(() => {
        wx.showToast({ title: "点赞成功", icon: "none" });
        this.fetchPosts();
      })
      .catch((err) => {
        console.error(err);
        wx.showToast({ title: "点赞失败", icon: "none" });
      });
  },

  onDeleteTap(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.showModal({
      title: "提示",
      content: "确定要删除这条帖子吗？",
      success: (res) => {
        if (!res.confirm) return;
        wx.cloud
          .database()
          .collection("posts")
          .doc(id)
          .remove()
          .then(() => {
            wx.showToast({ title: "已删除", icon: "success" });
            this.fetchPosts();
          })
          .catch((err) => {
            console.error(err);
            wx.showToast({ title: "删除失败", icon: "none" });
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

  addPostDoc(text, is_anonymous, imageUrl) {
    const data = {
      content: text,
      timestamp: Date.now(),
      is_anonymous,
      likes: 0,
    };
    if (imageUrl) {
      data.imageUrl = imageUrl;
    }
    return db.collection("posts").add({ data });
  },

  onPublish() {
    if (this.data.publishing) return;
    const text = (this.data.content || "").trim();
    if (!text) {
      wx.showToast({ title: "请先输入内容", icon: "none" });
      return;
    }
    const is_anonymous = !!this.data.anonymousPost;
    const fileList = this.data.fileList || [];
    const first = fileList[0];
    const localPath = first && (first.url || first.tempFilePath || first.path);
    const hasImage = !!localPath;

    this.setData({ publishing: true });

    const done = () => {
      wx.showToast({ title: "发布成功", icon: "success" });
      this.setData({ content: "", fileList: [], publishing: false });
      this.fetchPosts();
    };

    const fail = (err) => {
      console.error(err);
      this.setData({ publishing: false });
      wx.showToast({ title: "发布失败", icon: "none" });
    };

    if (hasImage) {
      const cloudPath = this.buildCloudPath(localPath);
      wx.cloud
        .uploadFile({
          cloudPath,
          filePath: localPath,
        })
        .then((up) => this.addPostDoc(text, is_anonymous, up.fileID))
        .then(done)
        .catch(fail);
    } else {
      this.addPostDoc(text, is_anonymous, "")
        .then(done)
        .catch(fail);
    }
  },
});
