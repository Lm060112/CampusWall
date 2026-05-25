const ANNOUNCEMENTS = [
  {
    id: "a1",
    type: "通知",
    title: "关于秋季学期宿舍电费充值的通知",
    date: "09-06",
    content: "为保障宿舍用电稳定，请同学们在本周内完成宿舍电费充值。充值完成后可在宿舍服务台或线上入口查询余额。",
  },
  {
    id: "a2",
    type: "活动",
    title: "迎新嘉年华 | 趣味打卡赢好礼",
    date: "09-05",
    content: "迎新嘉年华将在中心广场举行，现场设置集章打卡、社团展示、校园服务咨询等环节，欢迎同学们参加。",
  },
];

Page({
  data: {
    item: null,
  },

  onLoad(options = {}) {
    const item = ANNOUNCEMENTS.find((entry) => entry.id === options.id) || ANNOUNCEMENTS[Number(options.index || 0)] || ANNOUNCEMENTS[0];
    this.setData({ item });
  },

  onBack() {
    wx.navigateBack();
  },
});
