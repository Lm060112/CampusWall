const DEFAULT_ADDRESS = {
  name: "小汤圆",
  phone: "13800000000",
  campus: "崇明校区",
  building: "6号宿舍楼",
  room: "602",
  detail: "宿舍区东门取餐点",
  isDefault: true,
};

Page({
  data: {
    address: DEFAULT_ADDRESS,
  },

  onLoad() {
    const saved = wx.getStorageSync("mockDefaultAddress");
    if (saved) this.setData({ address: saved });
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`address.${field}`]: e.detail.value });
  },

  onSave() {
    const { address } = this.data;
    if (!address.name || !address.phone || !address.building) {
      wx.showToast({ title: "请补全姓名、电话和楼栋", icon: "none" });
      return;
    }
    wx.setStorageSync("mockDefaultAddress", { ...address, isDefault: true });
    wx.showToast({ title: "地址已保存", icon: "success" });
    setTimeout(() => wx.navigateBack(), 700);
  },

  onBack() {
    wx.navigateBack();
  },
});
