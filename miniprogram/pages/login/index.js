const app = getApp();

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
    };
  },

  saveUserInfo(userInfo) {
    app.globalData.userInfo = userInfo;
    wx.setStorageSync("userInfo", userInfo);
  },

  async onLoginTap() {
    if (this.data.syncing) return;
    this.setData({ syncing: true, cloudStatus: "正在同步云端用户..." });

    try {
      const profile = {
        nickName: this.data.nickname.trim() || "校园用户",
        campus: this.data.campus || "崇明校区",
        avatarUrl: "/images/avatar.png",
      };
      const res = await wx.cloud.callFunction({
        name: "campusApi",
        data: {
          action: "upsertUser",
          profile,
        },
      });

      if (!res.result || !res.result.success) {
        throw new Error((res.result && res.result.errMsg) || "云端同步失败");
      }

      const userInfo = this.buildUserInfo(res.result.data || {});
      this.saveUserInfo(userInfo);
      this.setData({ cloudStatus: "云端用户已同步" });
      wx.showToast({ title: "登录成功" });
      setTimeout(() => wx.navigateBack(), 700);
    } catch (error) {
      console.warn("cloud login fallback", error);
      const userInfo = this.buildUserInfo();
      this.saveUserInfo(userInfo);
      this.setData({ cloudStatus: "云端同步失败，已使用本地登录" });
      wx.showToast({ title: "已使用本地登录", icon: "none" });
    } finally {
      this.setData({ syncing: false });
    }
  },

  onBack() {
    wx.navigateBack();
  },
});
