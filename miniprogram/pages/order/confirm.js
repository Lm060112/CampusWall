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
    remarkPlaceholder: "例如：少冰、不要辣、打包、下课后取",
    submitText: "提交订单",
    initialStatus: "制作中",
    initialStatusText: "订单已提交",
    messageTitle: "订单已提交",
    messageContent(order) {
      return `${order.merchant.name} 已收到你的点单，取餐号 ${order.pickupNo}`;
    },
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
    remarkPlaceholder: "例如：送到6号楼门口、少冰、不要辣、电话联系",
    submitText: "提交外卖订单",
    initialStatus: "商家备餐",
    initialStatusText: "商家已接收订单",
    messageTitle: "外卖订单已提交",
    messageContent(order) {
      return `${order.merchant.name} 已接收订单，预计 ${order.merchant.eta}`;
    },
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
    initialStatus: "待接单",
    initialStatusText: "等待同学接单",
    messageTitle: "跑腿需求已发布",
    messageContent(order) {
      return `${order.merchant.name} 已发布，赏金 ¥${order.totalAmount / 100}`;
    },
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
    initialStatus: "已预约",
    initialStatusText: "预约成功，等待参加",
    messageTitle: "活动预约成功",
    messageContent(order) {
      return `${order.merchant.name} 已预约成功，时间：${order.merchant.eta}`;
    },
  },
};

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

  loadAddress() {
    const address = wx.getStorageSync("mockDefaultAddress") || {
      name: "小汤圆",
      phone: "13800000000",
      campus: "崇明校区",
      building: "6号宿舍楼",
      room: "602",
      detail: "宿舍区东门取餐点",
      isDefault: true,
    };
    const addressText = `${address.campus} ${address.building}${address.room ? ` ${address.room}` : ""}${address.detail ? ` · ${address.detail}` : ""}`;
    const contactText = `${address.name} ${address.phone}`;
    this.setData({ address, addressText, contactText });
  },

  onAddressTap() {
    wx.navigateTo({ url: "/pages/address/index" });
  },

  onSubmit() {
    if (!this.data.draft.items.length || this.data.submitting) return;
    this.setData({ submitting: true });
    const now = Date.now();
    const order = {
      id: `MOCK${now}`,
      pickupNo: `A${String(now).slice(-3)}`,
      ...this.data.draft,
      contact: this.data.viewMeta.needsAddress ? this.data.address : null,
      remark: this.data.remark,
      status: this.data.viewMeta.initialStatus,
      statusText: this.data.viewMeta.initialStatusText,
      paid: false,
      submittedAt: now,
    };
    const orders = wx.getStorageSync("mockOrders") || [];
    wx.setStorageSync("mockOrders", [order, ...orders]);
    this.addOrderMessage(order, this.data.viewMeta.messageTitle, this.data.viewMeta.messageContent(order), order.status);
    wx.showToast({ title: "订单已生成", icon: "success" });
    setTimeout(() => {
      wx.redirectTo({ url: `/pages/order/pay/index?id=${order.id}` });
    }, 600);
  },

  onBack() {
    wx.navigateBack();
  },

  addOrderMessage(order, title, content, status) {
    const messages = wx.getStorageSync("mockMessages") || [];
    const message = {
      id: `MSG${Date.now()}`,
      type: "order",
      orderId: order.id,
      title,
      content,
      status,
      statusClass: status === "已完成" ? "done" : "processing",
      icon: "/images/default-goods-image.png",
      unread: true,
      createdAt: Date.now(),
    };
    wx.setStorageSync("mockMessages", [message, ...messages]);
  },
});
