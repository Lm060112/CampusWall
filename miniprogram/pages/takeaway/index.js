const FALLBACK_MERCHANTS = [
  {
    id: "takeaway-hot",
    name: "川味小馆（崇明店）",
    tag: "川湘快餐",
    address: "崇明大道美食街 18 号",
    eta: "35分钟送达",
    rating: "4.8",
    coupons: ["新客减5元", "满29减5", "满49减10"],
    minPrice: 0,
    deliveryFee: 0,
    image: "/images/default-goods-image.png",
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
    merchants: FALLBACK_MERCHANTS,
  },

  onLoad() {
    this.loadMerchants();
  },

  async loadMerchants() {
    try {
      const result = await callCampusApi({ action: "listMerchants", sourceType: "takeaway", pageSize: 100 });
      if (!result.result || !result.result.success) {
        throw new Error((result.result && result.result.errMsg) || "list merchants failed");
      }
      const merchants = (result.result.data || []).map((item) => ({
        id: item.id,
        name: item.name,
        tag: item.tag,
        address: item.address,
        eta: item.eta,
        rating: item.rating,
        coupons: item.coupons || [],
        minPrice: item.minPrice || 0,
        deliveryFee: item.deliveryFee || 0,
        image: item.image || item.coverUrl || "/images/default-goods-image.png",
      }));
      this.setData({ merchants: merchants.length ? merchants : FALLBACK_MERCHANTS });
    } catch (err) {
      console.warn("load cloud takeaway merchants failed, use fallback", err);
      this.setData({ merchants: FALLBACK_MERCHANTS });
    }
  },

  onMerchantTap(e) {
    wx.navigateTo({ url: `/pages/merchant/detail?id=${e.currentTarget.dataset.id}` });
  },

  onBack() {
    wx.navigateBack();
  },
});
