App({
  onLaunch() {
    this.globalData = {
      env: "cloud1-d3gh3r7nm520f7c2b",
      userInfo: wx.getStorageSync("userInfo") || null,
    };

    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上基础库以使用云开发能力");
      return;
    }

    wx.cloud.init({
      env: this.globalData.env,
      traceUser: true,
    });
  },
});
