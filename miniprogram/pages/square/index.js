const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    content: "",
    fileList: [],
    anonymousPost: false,
    posts: [],
    loading: true,
    publishing: false,
    fieldAutosize: { minHeight: 160, maxHeight: 320 },
  },

  onLoad() {
    this.fetchPosts();
  },

  onContentChange(e) {
    this.setData({ content: e.detail || "" });
  },

  onUploaderAfterRead(e) {
    const { file } = e.detail;
    const f = Array.isArray(file) ? file[0] : file;
    const url = f.url || f.tempFilePath || f.path || "";
    if (!url) return;
    this.setData({
      fileList: [{ url, type: "image", name: f.name || "image" }],
    });
  },

  onUploaderDelete() {
    this.setData({ fileList: [] });
  },

  onAnonymousChange(e) {
    this.setData({ anonymousPost: !!e.detail });
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
        const posts = (res.data || []).map((doc) => this.normalizePost(doc));
        this.setData({ posts, loading: false });
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
