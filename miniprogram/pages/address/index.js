const DEFAULT_ADDRESS = {
  id: "addr_default",
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
    addresses: [],
    showEditor: false,
    editingId: "",
    form: { ...DEFAULT_ADDRESS },
  },

  onLoad() {
    this.loadAddresses();
  },

  onShow() {
    this.loadAddresses();
  },

  loadAddresses() {
    const savedList = wx.getStorageSync("mockAddresses");
    const savedDefault = wx.getStorageSync("mockDefaultAddress");
    let addresses = Array.isArray(savedList) && savedList.length ? savedList : [{ ...(savedDefault || DEFAULT_ADDRESS), id: "addr_default", isDefault: true }];
    if (!addresses.some((item) => item.isDefault)) addresses[0].isDefault = true;
    this.setData({ addresses });
    this.syncDefault(addresses);
  },

  saveAddresses(addresses) {
    wx.setStorageSync("mockAddresses", addresses);
    this.syncDefault(addresses);
    this.setData({ addresses });
  },

  syncDefault(addresses) {
    const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0];
    if (defaultAddress) wx.setStorageSync("mockDefaultAddress", { ...defaultAddress, isDefault: true });
  },

  resetForm() {
    return {
      id: `addr_${Date.now()}`,
      name: "",
      phone: "",
      campus: "崇明校区",
      building: "",
      room: "",
      detail: "",
      isDefault: !this.data.addresses.length,
    };
  },

  onBack() {
    wx.navigateBack();
  },

  onAddTap() {
    this.setData({ showEditor: true, editingId: "", form: this.resetForm() });
  },

  onEditTap(e) {
    const id = e.currentTarget.dataset.id;
    const target = this.data.addresses.find((item) => item.id === id);
    if (!target) return;
    this.setData({ showEditor: true, editingId: id, form: { ...target } });
  },

  onCloseEditor() {
    this.setData({ showEditor: false, editingId: "" });
  },

  stopBubble() {},

  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onDefaultChange(e) {
    this.setData({ "form.isDefault": e.detail.value });
  },

  validate(form) {
    if (!form.name || !form.phone || !form.building) {
      wx.showToast({ title: "请补全联系人、手机号和楼栋", icon: "none" });
      return false;
    }
    if (!/^1\d{10}$/.test(form.phone)) {
      wx.showToast({ title: "请输入正确手机号", icon: "none" });
      return false;
    }
    return true;
  },

  onSave() {
    const form = { ...this.data.form };
    if (!this.validate(form)) return;
    let addresses = this.data.addresses.slice();
    if (form.isDefault) {
      addresses = addresses.map((item) => ({ ...item, isDefault: false }));
    }
    if (this.data.editingId) {
      addresses = addresses.map((item) => (item.id === this.data.editingId ? form : item));
    } else {
      addresses.unshift(form);
    }
    if (!addresses.some((item) => item.isDefault)) addresses[0].isDefault = true;
    this.saveAddresses(addresses);
    this.setData({ showEditor: false, editingId: "" });
    wx.showToast({ title: "地址已保存" });
  },

  onSetDefault(e) {
    const id = e.currentTarget.dataset.id;
    const addresses = this.data.addresses.map((item) => ({ ...item, isDefault: item.id === id }));
    this.saveAddresses(addresses);
    wx.showToast({ title: "已设为默认" });
  },

  onDeleteTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "删除地址",
      content: "确定删除这个地址吗？",
      success: (res) => {
        if (!res.confirm) return;
        let addresses = this.data.addresses.filter((item) => item.id !== id);
        if (!addresses.length) addresses = [{ ...DEFAULT_ADDRESS }];
        if (!addresses.some((item) => item.isDefault)) addresses[0].isDefault = true;
        this.saveAddresses(addresses);
      },
    });
  },
});
