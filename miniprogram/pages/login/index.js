const app = getApp();

Page({
  data: {
    nickname: "",
    campus: "崇明校区",
  },

  onNameInput(e) {
    this.setData({ nickname: e.detail.value || "" });
  },

  onCampusInput(e) {
    this.setData({ campus: e.detail.value || "" });
  },

  onLoginTap() {
    const nickName = this.data.nickname.trim() || "校园用户";
    const userInfo = {
      nickName,
      campus: this.data.campus || "崇明校区",
      avatarUrl: "/images/avatar.png",
      loginMode: "mock",
    };
    app.globalData.userInfo = userInfo;
    wx.setStorageSync("userInfo", userInfo);
    wx.showToast({ title: "登录成功" });
    setTimeout(() => wx.navigateBack(), 600);
  },

  onBack() {
    wx.navigateBack();
  },
});
