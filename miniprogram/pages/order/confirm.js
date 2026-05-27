const CONFIRM_META = {
  campus: {
    title: "确认点单",
    typeTitle: "到店自取",
    tip: "请按取餐通知到指定服务点领取",
    icon: "shop-o",
    color: "#18a957",
    merchantLabel: "服务点",
    addressLabel: "取餐点",
    timeLabel: "预计时间",
    amountLabel: "商品小计",
    feeLabel: "取餐方式",
    feeText: "自取 ¥0",
    remarkTitle: "取餐备注",
    remarkPlaceholder: "例如：少冰、不辣、打包、下课后取",
    submitText: "提交订单",
    needsAddress: false,
  },
  takeaway: {
    title: "确认外卖",
    typeTitle: "校外配送",
    tip: "请确认配送位置，骑手会送到校门或宿舍区约定点",
    icon: "logistics",
    color: "#f08a1f",
    merchantLabel: "商家",
    addressLabel: "送达点",
    timeLabel: "预计送达",
    amountLabel: "商品+配送",
    feeLabel: "配送方式",
    feeText: "校外配送",
    remarkTitle: "配送备注",
    remarkPlaceholder: "例如：送到6号楼门口、少冰、不辣、电话联系",
    submitText: "提交外卖订单",
    needsAddress: true,
  },
  errand: {
    title: "确认跑腿",
    typeTitle: "跑腿代取",
    tip: "提交后等待同学接单，完成后可在订单详情确认",
    icon: "guide-o",
    color: "#178dff",
    merchantLabel: "服务类型",
    addressLabel: "路线",
    timeLabel: "预计完成",
    amountLabel: "跑腿赏金",
    feeLabel: "服务方式",
    feeText: "同学帮取",
    remarkTitle: "补充说明",
    remarkPlaceholder: "例如：取件码、购买品牌、送达后放门口、联系电话",
    submitText: "发布跑腿需求",
    needsAddress: true,
  },
  nearby: {
    title: "确认预约",
    typeTitle: "活动预约",
    tip: "请确认活动时间和地点，预约成功后按时参加",
    icon: "calendar-o",
    color: "#8b62f2",
    merchantLabel: "活动",
    addressLabel: "地点",
    timeLabel: "活动时间",
    amountLabel: "预约费用",
    feeLabel: "预约方式",
    feeText: "到场核销",
    remarkTitle: "预约备注",
    remarkPlaceholder: "例如：同行人数、是否新手、希望分到同一组",
    submitText: "确认预约",
    needsAddress: false,
  },
};

function callCampusApi(data) {
  return wx.cloud.callFunction({
    name: "campusApi",
    data,
  });
}

function getDefaultAddress() {
  return {
    name: "小汤圆",
    phone: "13800000000",
    campus: "崇明校区",
    building: "6号宿舍楼",
    room: "602",
    detail: "宿舍区东门取餐点",
    isDefault: true,
  };
}

function buildLocalOrder(draft, viewMeta, address, remark) {
  const time = Date.now();
  return {
    id: `MOCK${time}`,
    pickupNo: `A${String(time).slice(-3)}`,
    ...draft,
    contact: viewMeta.needsAddress ? address : null,
    remark,
    status: "pending_pay",
    statusText: "待付款",
    paid: false,
    paymentStatus: "unpaid",
    submittedAt: time,
    createdAt: time,
  };
}

function normalizeCloudOrder(order) {
  return {
    ...order,
    id: order._id || order.id,
    cloudId: order._id || order.cloudId,
    cloudSynced: true,
    submittedAt: order.createdAt || order.submittedAt || Date.now(),
  };
}

function saveLocalOrder(order) {
  const orders = wx.getStorageSync("mockOrders") || [];
  const id = order.id || order._id;
  const nextOrders = [order, ...orders.filter((item) => item.id !== id && item._id !== id)];
  wx.setStorageSync("mockOrders", nextOrders);
}

Page({
  data: {
    draft: {
      merchant: {},
      items: [],
      totalAmount: 0,
      pickupType: "到店自取",
    },
    viewMeta: CONFIRM_META.campus,
    address: null,
    contactText: "",
    addressText: "",
    remark: "",
    submitting: false,
  },

  onLoad(options = {}) {
    if (!options.draft) return;
    try {
      const draft = JSON.parse(decodeURIComponent(options.draft));
      const sourceType = draft.sourceType || "campus";
      this.setData({
        draft,
        viewMeta: CONFIRM_META[sourceType] || CONFIRM_META.campus,
      }, () => this.loadAddress());
    } catch (err) {
      console.error("Invalid order draft", err);
      wx.showToast({ title: "订单信息异常", icon: "none" });
    }
  },

  onShow() {
    this.loadAddress();
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  async loadAddress() {
    let address = wx.getStorageSync("mockDefaultAddress") || getDefaultAddress();
    try {
      const result = await callCampusApi({ action: "listAddresses" });
      if (result.result && result.result.success && Array.isArray(result.result.data) && result.result.data.length) {
        address = result.result.data.find((item) => item.isDefault) || result.result.data[0];
        wx.setStorageSync("mockDefaultAddress", { ...address, id: address._id || address.id, isDefault: true });
      }
    } catch (err) {
      console.warn("load cloud default address failed, use local fallback", err);
    }
    const addressText = `${address.campus} ${address.building}${address.room ? ` ${address.room}` : ""}${address.detail ? ` · ${address.detail}` : ""}`;
    const contactText = `${address.name} ${address.phone}`;
    this.setData({ address: { ...address, id: address._id || address.id }, addressText, contactText });
  },

  onAddressTap() {
    wx.navigateTo({ url: "/pages/address/index" });
  },

  async onSubmit() {
    if (!this.data.draft.items.length || this.data.submitting) return;
    this.setData({ submitting: true });

    const localOrder = buildLocalOrder(
      this.data.draft,
      this.data.viewMeta,
      this.data.address,
      this.data.remark,
    );

    try {
      const result = await callCampusApi({
        action: "createOrder",
        order: {
          sourceType: localOrder.sourceType,
          merchantId: localOrder.merchantId || (localOrder.merchant && localOrder.merchant.id) || "",
          merchant: localOrder.merchant,
          items: localOrder.items,
          totalAmount: localOrder.totalAmount,
          contact: localOrder.contact,
          remark: localOrder.remark,
          pickupNo: localOrder.pickupNo,
          pickupType: localOrder.pickupType,
        },
      });

      const cloudData = result && result.result && result.result.data;
      if (!result.result || !result.result.success || !cloudData) {
        throw new Error((result.result && result.result.errMsg) || "create order failed");
      }

      const order = normalizeCloudOrder(cloudData);
      saveLocalOrder(order);
      wx.showToast({ title: "订单已生成", icon: "success" });
      setTimeout(() => {
        wx.redirectTo({ url: `/pages/order/pay/index?id=${order.id}` });
      }, 500);
    } catch (err) {
      console.warn("create cloud order failed, use local fallback", err);
      saveLocalOrder(localOrder);
      wx.showToast({ title: "已本地生成订单", icon: "none" });
      setTimeout(() => {
        wx.redirectTo({ url: `/pages/order/pay/index?id=${localOrder.id}` });
      }, 500);
    } finally {
      this.setData({ submitting: false });
    }
  },

  onBack() {
    wx.navigateBack();
  },
});
