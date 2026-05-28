const app = getApp();

const CLOUD_TIMEOUT = 8000;

function withTimeout(promise, timeout = CLOUD_TIMEOUT) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("云端同步超时")), timeout);
    }),
  ]);
}

Page({
  data: {
    nickname: "",
    campus: "崇明校区",
    syncing: false,
    cloudStatus: "",
  },

  onNameInput(e) {
    this.setData({ nickname: e.detail.value || "" });
  },

  onCampusInput(e) {
    this.setData({ campus: e.detail.value || "" });
  },

  buildUserInfo(cloudUser = {}) {
    const nickName = this.data.nickname.trim() || "校园用户";
    return {
      _id: cloudUser._id || "",
      openid: cloudUser._openid || "",
      nickName,
      campus: this.data.campus || "崇明校区",
      avatarUrl: "/images/avatar.png",
      loginMode: cloudUser._openid ? "cloud" : "local",
      role: cloudUser.role || "student",
      permissions: cloudUser.permissions || [],
    };
  },

  saveUserInfo(userInfo) {
    app.globalData.userInfo = userInfo;
    wx.setStorageSync("userInfo", userInfo);
  },

  finishLogin(userInfo, toastTitle, delay = 700) {
    this.saveUserInfo(userInfo);
    wx.showToast({ title: toastTitle, icon: toastTitle.includes("本地") ? "none" : "success" });
    setTimeout(() => wx.navigateBack(), delay);
  },

  async onLoginTap() {
    if (this.data.syncing) return;
    this.setData({ syncing: true, cloudStatus: "正在同步云端用户..." });

    const profile = {
      nickName: this.data.nickname.trim() || "校园用户",
      campus: this.data.campus || "崇明校区",
      avatarUrl: "/images/avatar.png",
    };

    try {
      const res = await withTimeout(wx.cloud.callFunction({
        name: "campusApi",
        data: {
          action: "upsertUser",
          profile,
        },
      }));

      if (!res.result || !res.result.success) {
        throw new Error((res.result && res.result.errMsg) || "云端同步失败");
      }

      const userInfo = this.buildUserInfo(res.result.data || {});
      this.setData({ cloudStatus: "云端用户已同步", syncing: false });
      this.finishLogin(userInfo, "登录成功");
    } catch (error) {
      console.warn("cloud login fallback", error);
      const userInfo = this.buildUserInfo();
      this.setData({
        syncing: false,
        cloudStatus: "云端暂未返回，已使用本地登录",
      });
      this.finishLogin(userInfo, "已使用本地登录", 900);
    }
  },

  onBack() {
    wx.navigateBack();
  },
});
