const ACTIVITIES = [
  {
    id: "a1",
    name: "周六羽毛球友谊赛",
    tag: "运动活动",
    location: "体育馆二楼羽毛球馆",
    time: "周六 14:00-17:00",
    price: 600,
    rating: "4.9",
    desc: "新手友好，现场组队，适合周末放松。",
  },
  {
    id: "a2",
    name: "东门桌游拼局",
    tag: "休闲娱乐",
    location: "东门桌游社",
    time: "今晚 19:30-22:00",
    price: 1800,
    rating: "4.8",
    desc: "狼人杀、阿瓦隆、UNO，满 6 人开局。",
  },
  {
    id: "a3",
    name: "校园周边探店路线",
    tag: "周边探店",
    location: "崇明大学城商业街",
    time: "本周日 10:00 集合",
    price: 900,
    rating: "4.7",
    desc: "咖啡、甜品和拍照点路线，新生适合。",
  },
];

Page({
  data: {
    activities: ACTIVITIES,
  },

  onReserveTap(e) {
    const activity = ACTIVITIES.find((item) => item.id === e.currentTarget.dataset.id);
    if (!activity) return;
    const draft = {
      merchant: {
        name: activity.name,
        tag: activity.tag,
        address: activity.location,
        eta: activity.time,
      },
      items: [
        {
          id: activity.id,
          name: "活动预约名额",
          price: activity.price,
          count: 1,
          image: "/images/default-goods-image.png",
        },
      ],
      totalAmount: activity.price,
      pickupType: "活动预约",
      sourceType: "nearby",
      createdAt: Date.now(),
    };
    wx.navigateTo({ url: `/pages/order/confirm?draft=${encodeURIComponent(JSON.stringify(draft))}` });
  },

  onBack() {
    wx.navigateBack();
  },
});
