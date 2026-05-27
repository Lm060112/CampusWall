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

function callCampusApi(data) {
  return wx.cloud.callFunction({
    name: "campusApi",
    data,
  });
}

function normalizeAddress(address, cloudSynced = false) {
  return {
    ...address,
    id: address._id || address.id,
    cloudId: address._id || address.cloudId,
    cloudSynced,
  };
}

Page({
  data: {
    addresses: [],
    showEditor: false,
    editingId: "",
    form: { ...DEFAULT_ADDRESS },
    cloudReady: false,
    loading: false,
  },

  onLoad() {
    this.loadAddresses();
  },

  onShow() {
    this.loadAddresses();
  },

  async loadAddresses() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const result = await callCampusApi({ action: "listAddresses" });
      if (!result.result || !result.result.success) {
        throw new Error((result.result && result.result.errMsg) || "list addresses failed");
      }
      let addresses = (result.result.data || []).map((item) => normalizeAddress(item, true));
      if (!addresses.length) {
        addresses = this.loadLocalAddresses();
        if (addresses.length === 1 && addresses[0].id === "addr_default") {
          addresses[0].cloudSynced = false;
        }
      }
      this.ensureDefault(addresses);
      this.setData({ addresses, cloudReady: true });
      this.syncLocal(addresses);
    } catch (err) {
      console.warn("load cloud addresses failed, use local fallback", err);
      const addresses = this.loadLocalAddresses();
      this.setData({ addresses, cloudReady: false });
      this.syncDefault(addresses);
    } finally {
      this.setData({ loading: false });
    }
  },

  loadLocalAddresses() {
    const savedList = wx.getStorageSync("mockAddresses");
    const savedDefault = wx.getStorageSync("mockDefaultAddress");
    const addresses = Array.isArray(savedList) && savedList.length
      ? savedList.map((item) => normalizeAddress(item, !!item.cloudSynced))
      : [{ ...(savedDefault || DEFAULT_ADDRESS), id: "addr_default", isDefault: true }];
    this.ensureDefault(addresses);
    return addresses;
  },

  ensureDefault(addresses) {
    if (addresses.length && !addresses.some((item) => item.isDefault)) {
      addresses[0].isDefault = true;
    }
  },

  syncLocal(addresses) {
    wx.setStorageSync("mockAddresses", addresses);
    this.syncDefault(addresses);
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

  saveLocalAddress(form) {
    let addresses = this.data.addresses.slice();
    if (form.isDefault) {
      addresses = addresses.map((item) => ({ ...item, isDefault: false }));
    }
    if (this.data.editingId) {
      addresses = addresses.map((item) => (item.id === this.data.editingId ? form : item));
    } else {
      addresses.unshift(form);
    }
    this.ensureDefault(addresses);
    this.syncLocal(addresses);
    this.setData({ addresses });
  },

  async onSave() {
    const form = { ...this.data.form };
    if (!this.validate(form)) return;

    try {
      const result = await callCampusApi({
        action: "saveAddress",
        address: {
          _id: form.cloudId || (form.cloudSynced ? form.id : ""),
          name: form.name,
          phone: form.phone,
          campus: form.campus,
          building: form.building,
          room: form.room,
          detail: form.detail,
          isDefault: form.isDefault,
        },
      });
      if (!result.result || !result.result.success || !result.result.data) {
        throw new Error((result.result && result.result.errMsg) || "save address failed");
      }
      wx.showToast({ title: "地址已保存" });
      this.setData({ showEditor: false, editingId: "" });
      this.loadAddresses();
    } catch (err) {
      console.warn("save cloud address failed, use local fallback", err);
      this.saveLocalAddress(form);
      this.setData({ showEditor: false, editingId: "" });
      wx.showToast({ title: "已本地保存", icon: "none" });
    }
  },

  async onSetDefault(e) {
    const id = e.currentTarget.dataset.id;
    const target = this.data.addresses.find((item) => item.id === id);
    if (!target) return;

    if (target.cloudSynced) {
      try {
        const result = await callCampusApi({
          action: "setDefaultAddress",
          addressId: target.cloudId || target.id,
        });
        if (!result.result || !result.result.success) {
          throw new Error((result.result && result.result.errMsg) || "set default failed");
        }
        wx.showToast({ title: "已设为默认" });
        this.loadAddresses();
        return;
      } catch (err) {
        console.warn("set cloud default failed, use local fallback", err);
      }
    }

    const addresses = this.data.addresses.map((item) => ({ ...item, isDefault: item.id === id }));
    this.syncLocal(addresses);
    this.setData({ addresses });
    wx.showToast({ title: "已设为默认" });
  },

  async deleteCloudAddress(target) {
    const result = await callCampusApi({
      action: "deleteAddress",
      addressId: target.cloudId || target.id,
    });
    if (!result.result || !result.result.success) {
      throw new Error((result.result && result.result.errMsg) || "delete address failed");
    }
  },

  onDeleteTap(e) {
    const id = e.currentTarget.dataset.id;
    const target = this.data.addresses.find((item) => item.id === id);
    if (!target) return;

    wx.showModal({
      title: "删除地址",
      content: "确定删除这个地址吗？",
      success: async (res) => {
        if (!res.confirm) return;

        try {
          if (target.cloudSynced) {
            await this.deleteCloudAddress(target);
            wx.showToast({ title: "已删除" });
            this.loadAddresses();
            return;
          }
        } catch (err) {
          console.warn("delete cloud address failed, use local fallback", err);
        }

        let addresses = this.data.addresses.filter((item) => item.id !== id);
        if (!addresses.length) addresses = [{ ...DEFAULT_ADDRESS }];
        this.ensureDefault(addresses);
        this.syncLocal(addresses);
        this.setData({ addresses });
      },
    });
  },
});
