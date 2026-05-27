function callCampusApi(data) {
  return wx.cloud.callFunction({
    name: "campusApi",
    data,
  });
}

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
    this.loadSettings();
  },

  async loadSettings() {
    const saved = wx.getStorageSync("mockMessageSettings");
    if (saved) this.setData({ settings: saved });
    try {
      const result = await callCampusApi({ action: "getMessageSettings" });
      if (result.result && result.result.success && result.result.data) {
        this.setData({ settings: result.result.data });
        wx.setStorageSync("mockMessageSettings", result.result.data);
      }
    } catch (err) {
      console.warn("load cloud message settings failed", err);
    }
  },

  async onSwitchChange(e) {
    const key = e.currentTarget.dataset.key;
    const settings = { ...this.data.settings, [key]: e.detail.value };
    wx.setStorageSync("mockMessageSettings", settings);
    this.setData({ settings });
    try {
      await callCampusApi({ action: "saveMessageSettings", settings });
    } catch (err) {
      console.warn("save cloud message settings failed", err);
    }
  },

  onBack() {
    wx.navigateBack();
  },
});
