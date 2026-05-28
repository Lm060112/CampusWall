Page({
  data: {
    form: {
      name: "",
      campus: "",
      studentNo: "",
      desc: "",
    },
    submitting: false,
  },

  onLoad() {
    const userInfo = wx.getStorageSync("userInfo") || {};
    this.setData({
      form: {
        name: userInfo.nickName || "",
        campus: userInfo.campus || "",
        studentNo: "",
        desc: "",
      },
    });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  async onSubmit() {
    const form = this.data.form;
    if (!form.name || !form.campus) {
      wx.showToast({ title: "请填写姓名和校区", icon: "none" });
      return;
    }
    this.setData({ submitting: true });
    try {
      const res = await wx.cloud.callFunction({
        name: "campusApi",
        data: {
          action: "submitVerification",
          verification: form,
        },
      });
      if (!res.result || !res.result.success) {
        throw new Error((res.result && res.result.errMsg) || "提交失败");
      }
      wx.showToast({ title: "已提交审核", icon: "success" });
      setTimeout(() => wx.navigateBack(), 700);
    } catch (err) {
      wx.showToast({ title: err.message || "提交失败", icon: "none" });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
