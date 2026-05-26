# 校园生活小程序数据库设计 V1

本文档用于指导微信云开发数据库建表、权限配置和后端接口接入。当前项目已经完成前端主要闭环，数据库阶段建议从“校园墙真实闭环”开始，再逐步接订单、商家和支付。

## 设计原则

- 先建完整结构，先接最小闭环。
- 用户身份统一使用微信云开发 `_openid` 关联。
- 所有金额字段使用“分”为单位，例如 `price: 1600` 表示 16.00 元。
- 删除内容优先使用软删除：`status: deleted`，避免误删数据。
- 点赞、收藏、浏览等行为单独放入 `interactions`，不要把用户 openid 无限塞进帖子数组。
- 前端展示字段和数据库字段尽量保持一致，后续接入时少改页面。

## 第一阶段优先集合

第一阶段建议先创建并接入这些集合：

1. `users`
2. `posts`
3. `comments`
4. `interactions`
5. `messages`
6. `orders`

其中最先接真实数据库的是：`users`、`posts`、`comments`、`interactions`。

## users

用户基础资料。普通学生、跑腿人员、商家管理员、平台管理员都放在这里，通过 `role` 区分。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `_id` | string | 是 | 云数据库文档 ID |
| `_openid` | string | 是 | 微信 openid，云开发自动注入 |
| `nickName` | string | 否 | 昵称 |
| `avatarUrl` | string | 否 | 头像 |
| `campus` | string | 否 | 校区，例如“崇明校区” |
| `studentVerified` | boolean | 是 | 是否完成校园身份认证，默认 `false` |
| `phone` | string | 否 | 手机号 |
| `role` | string | 是 | `student`、`runner`、`merchant_staff`、`admin` |
| `status` | string | 是 | `active`、`disabled` |
| `createdAt` | number | 是 | 创建时间 |
| `updatedAt` | number | 是 | 更新时间 |

示例：

```json
{
  "_openid": "OPENID",
  "nickName": "小汤圆",
  "avatarUrl": "/images/avatar.png",
  "campus": "崇明校区",
  "studentVerified": false,
  "role": "student",
  "status": "active",
  "createdAt": 1710000000000,
  "updatedAt": 1710000000000
}
```

## posts

校园墙帖子，覆盖闲置、求助、拼车、活动。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `_id` | string | 是 | 文档 ID |
| `_openid` | string | 是 | 发布者 openid |
| `authorId` | string | 否 | 对应 `users._id` |
| `authorName` | string | 是 | 发布时展示昵称 |
| `authorAvatar` | string | 否 | 发布时展示头像 |
| `tag` | string | 是 | `idle`、`help`、`carpool`、`activity` |
| `tagText` | string | 是 | `闲置`、`求助`、`拼车`、`活动` |
| `topic` | string | 否 | 话题/标题 |
| `content` | string | 是 | 正文 |
| `images` | array | 是 | 图片 fileID 数组，默认 `[]` |
| `location` | string | 否 | 地点 |
| `price` | number | 否 | 闲置价格，单位分 |
| `routeText` | string | 否 | 拼车路线 |
| `departTime` | string | 否 | 拼车出发时间 |
| `seats` | number | 否 | 拼车余位 |
| `eventTitle` | string | 否 | 活动标题 |
| `eventTime` | string | 否 | 活动时间 |
| `likeCount` | number | 是 | 点赞数 |
| `commentCount` | number | 是 | 评论数 |
| `favoriteCount` | number | 是 | 收藏数 |
| `viewCount` | number | 是 | 浏览数 |
| `status` | string | 是 | `published`、`hidden`、`deleted`、`pending_review` |
| `createdAt` | number | 是 | 发布时间 |
| `updatedAt` | number | 是 | 更新时间 |

## comments

帖子评论。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `_id` | string | 是 | 文档 ID |
| `_openid` | string | 是 | 评论者 openid |
| `postId` | string | 是 | 对应 `posts._id` |
| `authorId` | string | 否 | 对应 `users._id` |
| `authorName` | string | 是 | 评论昵称 |
| `authorAvatar` | string | 否 | 评论头像 |
| `content` | string | 是 | 评论内容 |
| `likeCount` | number | 是 | 评论点赞数 |
| `status` | string | 是 | `published`、`hidden`、`deleted` |
| `createdAt` | number | 是 | 评论时间 |

## interactions

统一记录用户行为，包含点赞、收藏、浏览。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `_id` | string | 是 | 文档 ID |
| `_openid` | string | 是 | 操作用户 openid |
| `targetType` | string | 是 | `post`、`comment`、`merchant`、`product` |
| `targetId` | string | 是 | 目标 ID |
| `interactionType` | string | 是 | `like`、`favorite`、`view` |
| `createdAt` | number | 是 | 创建时间 |

建议唯一性逻辑：`_openid + targetType + targetId + interactionType`。云数据库不强制唯一，需要在云函数里先查再写。

## messages

消息中心数据源，包含互动消息、订单消息、系统通知。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `_id` | string | 是 | 文档 ID |
| `_openid` | string | 是 | 接收者 openid |
| `category` | string | 是 | `interaction`、`order`、`system` |
| `title` | string | 是 | 标题 |
| `content` | string | 是 | 内容 |
| `targetType` | string | 否 | `post`、`comment`、`order`、`system` |
| `targetId` | string | 否 | 跳转目标 ID |
| `status` | string | 否 | 订单/通知状态 |
| `isRead` | boolean | 是 | 是否已读 |
| `createdAt` | number | 是 | 创建时间 |

## orders

统一订单集合，校内点单、校外外卖、跑腿、周边玩乐都通过 `sourceType` 区分。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `_id` | string | 是 | 文档 ID |
| `_openid` | string | 是 | 下单用户 openid |
| `orderNo` | string | 是 | 业务订单号 |
| `sourceType` | string | 是 | `campus`、`takeaway`、`errand`、`nearby` |
| `merchantId` | string | 否 | 商家/服务点 ID |
| `merchant` | object | 是 | 下单时快照，含名称、地址、eta |
| `items` | array | 是 | 商品/服务明细 |
| `totalAmount` | number | 是 | 总金额，单位分 |
| `paid` | boolean | 是 | 是否已支付 |
| `paymentStatus` | string | 是 | `unpaid`、`paid`、`refunded` |
| `status` | string | 是 | `pending_pay`、`preparing`、`delivering`、`ready`、`completed`、`refund_pending`、`cancelled` |
| `statusText` | string | 是 | 前端展示状态 |
| `contact` | object | 否 | 联系人与地址信息 |
| `remark` | string | 否 | 备注 |
| `pickupNo` | string | 否 | 取餐号 |
| `review` | object | 否 | 评价快照 |
| `refund` | object | 否 | 售后快照 |
| `createdAt` | number | 是 | 创建时间 |
| `updatedAt` | number | 是 | 更新时间 |

## order_logs

订单状态流转记录。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `_id` | string | 是 | 文档 ID |
| `orderId` | string | 是 | 对应 `orders._id` |
| `_openid` | string | 否 | 操作人 openid |
| `fromStatus` | string | 否 | 原状态 |
| `toStatus` | string | 是 | 新状态 |
| `note` | string | 否 | 备注 |
| `createdAt` | number | 是 | 创建时间 |

## merchants

校内服务点和校外商家。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `_id` | string | 是 | 文档 ID |
| `name` | string | 是 | 名称 |
| `scene` | string | 是 | `campus`、`takeaway`、`nearby` |
| `category` | string | 是 | 咖啡饮品、食堂窗口、川湘快餐等 |
| `coverUrl` | string | 否 | 封面 fileID |
| `address` | string | 是 | 地址 |
| `campus` | string | 否 | 所属校区 |
| `rating` | number | 否 | 评分 |
| `salesText` | string | 否 | 销量文案 |
| `eta` | string | 否 | 预计时间 |
| `distanceText` | string | 否 | 距离文案 |
| `notice` | string | 否 | 公告 |
| `coupons` | array | 是 | 优惠标签 |
| `status` | string | 是 | `online`、`offline`、`closed` |
| `sort` | number | 是 | 排序 |
| `createdAt` | number | 是 | 创建时间 |
| `updatedAt` | number | 是 | 更新时间 |

## products

商品、套餐、活动票、服务项。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `_id` | string | 是 | 文档 ID |
| `merchantId` | string | 是 | 对应 `merchants._id` |
| `sourceType` | string | 是 | `campus`、`takeaway`、`nearby` |
| `category` | string | 是 | 热销、咖啡、套餐等 |
| `name` | string | 是 | 商品名 |
| `description` | string | 否 | 描述 |
| `image` | string | 否 | 图片 fileID |
| `price` | number | 是 | 价格，单位分 |
| `stock` | number | 否 | 库存 |
| `sales` | number | 是 | 销量 |
| `status` | string | 是 | `online`、`offline` |
| `sort` | number | 是 | 排序 |
| `createdAt` | number | 是 | 创建时间 |
| `updatedAt` | number | 是 | 更新时间 |

## addresses

收货/取餐地址。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `_id` | string | 是 | 文档 ID |
| `_openid` | string | 是 | 用户 openid |
| `name` | string | 是 | 联系人 |
| `phone` | string | 是 | 手机号 |
| `campus` | string | 是 | 校区 |
| `building` | string | 是 | 楼栋/地点 |
| `room` | string | 否 | 房间/补充 |
| `detail` | string | 否 | 详细说明 |
| `isDefault` | boolean | 是 | 是否默认 |
| `createdAt` | number | 是 | 创建时间 |
| `updatedAt` | number | 是 | 更新时间 |

## coupons

优惠券。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `_id` | string | 是 | 文档 ID |
| `_openid` | string | 否 | 用户券需要；平台券可为空 |
| `title` | string | 是 | 券名 |
| `type` | string | 是 | `discount`、`cash`、`shipping` |
| `amount` | number | 是 | 优惠金额，单位分 |
| `minAmount` | number | 是 | 使用门槛，单位分 |
| `sourceType` | string | 否 | 适用模块 |
| `merchantId` | string | 否 | 适用商家 |
| `status` | string | 是 | `unused`、`used`、`expired` |
| `startAt` | number | 是 | 生效时间 |
| `endAt` | number | 是 | 过期时间 |
| `createdAt` | number | 是 | 创建时间 |

## announcements

校园公告、活动通知。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `_id` | string | 是 | 文档 ID |
| `type` | string | 是 | `notice`、`activity`、`service` |
| `title` | string | 是 | 标题 |
| `summary` | string | 否 | 摘要 |
| `content` | string | 是 | 正文 |
| `coverUrl` | string | 否 | 封面 |
| `status` | string | 是 | `published`、`draft`、`hidden` |
| `publishedAt` | number | 是 | 发布时间 |
| `createdAt` | number | 是 | 创建时间 |
| `updatedAt` | number | 是 | 更新时间 |

## 索引建议

| 集合 | 索引 |
| --- | --- |
| `users` | `_openid` |
| `posts` | `status + createdAt desc`、`tag + status + createdAt desc`、`_openid + createdAt desc` |
| `comments` | `postId + status + createdAt asc`、`_openid + createdAt desc` |
| `interactions` | `_openid + targetType + interactionType + createdAt desc`、`targetType + targetId + interactionType` |
| `messages` | `_openid + category + isRead + createdAt desc` |
| `orders` | `_openid + createdAt desc`、`_openid + status + createdAt desc`、`sourceType + status + createdAt desc` |
| `order_logs` | `orderId + createdAt asc` |
| `merchants` | `scene + status + sort asc` |
| `products` | `merchantId + status + sort asc`、`sourceType + status + sort asc` |
| `addresses` | `_openid + isDefault` |
| `coupons` | `_openid + status + endAt asc` |
| `announcements` | `status + publishedAt desc` |

## 权限建议

第一阶段建议使用“云函数读写，客户端只读或不可直接读写”的方式，降低误操作风险。

| 集合 | 建议权限 |
| --- | --- |
| `users` | 仅创建者可读写，管理员通过云函数管理 |
| `posts` | 所有人可读已发布内容；创建、修改、删除走云函数 |
| `comments` | 所有人可读已发布评论；创建、删除走云函数 |
| `interactions` | 仅创建者可读写；统计由云函数维护 |
| `messages` | 仅创建者可读写 |
| `orders` | 仅创建者可读；写入和状态变更走云函数 |
| `merchants/products/announcements` | 所有人可读上线内容；写入仅管理员/商家云函数 |

## 第一阶段接入顺序

1. 开通云开发环境，填写 `miniprogram/envList.js`。
2. 在云开发控制台创建集合：`users`、`posts`、`comments`、`interactions`。
3. 上传并部署 `cloudfunctions/campusApi`。
4. 前端登录页调用 `campusApi.upsertUser`。
5. 发现页从 `campusApi.listPosts` 读取。
6. 发布弹窗调用 `campusApi.createPost`。
7. 帖子详情调用 `campusApi.listComments`、`campusApi.addComment`。
8. 点赞/收藏调用 `campusApi.toggleInteraction`。
9. 稳定后再接 `orders`、`messages`、`merchants`、`products`。
