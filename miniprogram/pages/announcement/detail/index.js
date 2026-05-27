const FALLBACK_ANNOUNCEMENTS = [
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

function callCampusApi(data) {
  return wx.cloud.callFunction({
    name: "campusApi",
    data,
  });
}

Page({
  data: {
    item: null,
  },

  onLoad(options = {}) {
    this.loadAnnouncement(options.id, options.index);
  },

  async loadAnnouncement(id, index = 0) {
    try {
      const result = await callCampusApi({ action: "getAnnouncement", announcementId: id || "a1" });
      if (!result.result || !result.result.success || !result.result.data) {
        throw new Error((result.result && result.result.errMsg) || "get announcement failed");
      }
      this.setData({ item: result.result.data });
    } catch (err) {
      console.warn("load cloud announcement failed, use fallback", err);
      const item = FALLBACK_ANNOUNCEMENTS.find((entry) => entry.id === id)
        || FALLBACK_ANNOUNCEMENTS[Number(index || 0)]
        || FALLBACK_ANNOUNCEMENTS[0];
      this.setData({ item });
    }
  },

  onBack() {
    wx.navigateBack();
  },
});
