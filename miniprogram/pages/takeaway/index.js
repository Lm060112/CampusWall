const MERCHANTS = [
  {
    id: "t1",
    name: "沪上阿姨（校外店）",
    tag: "奶茶饮品",
    address: "崇明大学城商业街 18 号",
    eta: "35分钟送达",
    rating: "4.8",
    coupons: ["满20减3", "第二杯半价"],
    minPrice: 12,
    deliveryFee: 2,
  },
  {
    id: "t2",
    name: "幸运咖啡",
    tag: "咖啡轻食",
    address: "崇明大道 66 号",
    eta: "28分钟送达",
    rating: "4.7",
    coupons: ["折扣优惠", "新客立减"],
    minPrice: 15,
    deliveryFee: 3,
  },
  {
    id: "t3",
    name: "夜宵小馆",
    tag: "烧烤夜宵",
    address: "东门美食街 9 号",
    eta: "45分钟送达",
    rating: "4.6",
    coupons: ["满35减6", "夜宵热卖"],
    minPrice: 20,
    deliveryFee: 4,
  },
];

Page({
  data: {
    merchants: MERCHANTS,
  },

  onMerchantTap(e) {
    wx.navigateTo({ url: `/pages/takeaway/detail?id=${e.currentTarget.dataset.id}` });
  },

  onBack() {
    wx.navigateBack();
  },
});
