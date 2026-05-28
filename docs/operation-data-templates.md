# 校园生活小程序运营数据录入模板

## 商家/校内服务 merchants

```json
{
  "id": "campus-cafe",
  "sourceType": "campus",
  "name": "校内咖啡厅",
  "tag": "校内自营",
  "category": "咖啡饮品",
  "status": "营业中",
  "rating": "4.8",
  "distance": "图书馆一楼",
  "eta": "10-15分钟自取",
  "sales": "今日已出 86 单",
  "address": "崇明校区图书馆一楼西侧",
  "notice": "下单后请留意取餐通知",
  "coupons": ["自取免排队"],
  "coverUrl": "/images/default-goods-image.png",
  "image": "/images/default-goods-image.png",
  "sort": 10,
  "isHot": true,
  "isNearby": false,
  "minPrice": 0,
  "deliveryFee": 0
}
```

## 商品 products

```json
{
  "id": "coffee-01",
  "merchantId": "campus-cafe",
  "sourceType": "campus",
  "category": "热销",
  "name": "拿铁咖啡",
  "desc": "默认热饮，可备注少冰/少糖",
  "image": "/images/default-goods-image.png",
  "price": 1600,
  "stock": 99,
  "sales": "今日 36",
  "status": "active",
  "sort": 10
}
```

## 公告 announcements

```json
{
  "id": "notice-001",
  "type": "通知",
  "title": "关于宿舍电费充值的通知",
  "date": "05-28",
  "content": "请同学们在规定时间内完成宿舍电费充值。",
  "sort": 10,
  "status": "published"
}
```

## 活动/周边玩乐 posts 或活动商品

```json
{
  "id": "badminton-001",
  "type": "活动",
  "title": "周六羽毛球友谊赛",
  "time": "05-31 14:00-17:00",
  "location": "体育馆二楼羽毛球馆",
  "capacity": 24,
  "price": 0,
  "status": "published"
}
```

## 录入原则

- `id` 必须稳定且唯一，后续不要随意改。
- 金额统一用“分”，例如 `1600` 表示 16 元。
- 图片先用本地默认图，真实上线前再迁移到云存储。
- `sourceType` 建议固定为 `campus`、`takeaway`、`errand`、`nearby`。
- 下架内容不要删除，优先把 `status` 改为 `inactive` 或 `hidden`。
