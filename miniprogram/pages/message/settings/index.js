Page({
  data: {
    settings: {
      interaction: true,
      order: true,
      system: true,
      quiet: false,
    },
  },

  onShow() {
    const saved = wx.getStorageSync("mockMessageSettings");
    if (saved) this.setData({ settings: saved });
  },

  onSwitchChange(e) {
    const key = e.currentTarget.dataset.key;
    const settings = { ...this.data.settings, [key]: e.detail.value };
    wx.setStorageSync("mockMessageSettings", settings);
    this.setData({ settings });
  },

  onBack() {
    wx.navigateBack();
  },
});
