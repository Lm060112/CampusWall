const app = getApp();

Page({
  data: {
    userInfo: null,
    hasUserInfo: false
  },

  onShow() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo,
        hasUserInfo: true
      });
    }
  },

  onLogin() {
    // 模拟登录逻辑，实际开发中建议使用头像昵称填写功能
    wx.showModal({
      title: '模拟登录',
      editable: true,
      placeholderText: '请输入你的昵称',
      success: (res) => {
        if (res.confirm && res.content) {
          const userInfo = {
            nickName: res.content,
            avatarUrl: '' // 留空，使用默认头像
          };
          app.globalData.userInfo = userInfo;
          wx.setStorageSync('userInfo', userInfo);
          this.setData({
            userInfo,
            hasUserInfo: true
          });
          wx.showToast({ title: '登录成功' });
        }
      }
    });
  },

  onLogout() {
    app.globalData.userInfo = null;
    wx.removeStorageSync('userInfo');
    this.setData({
      userInfo: null,
      hasUserInfo: false
    });
    wx.showToast({ title: '已退出', icon: 'none' });
  }
})