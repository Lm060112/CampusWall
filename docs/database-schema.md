# 校园生活小程序数据库设计草案

这份文档先约定后续开发需要的核心集合。当前代码已经使用 `posts`、`comments`、`sales`，后续建议逐步迁移到下面的业务集合结构。

## users

用户基础资料。所有订单、发布、收藏、消息都应通过 `openid` 关联用户。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 云数据库文档 ID |
| `_openid` | string | 微信用户 openid |
| `nickName` | string | 昵称 |
| `avatarUrl` | string | 头像 |
| `phone` | string | 手机号，可选 |
| `role` | string | `user`、`runner`、`merchant`、`admin` |
| `createdAt` | number | 创建时间 |
| `updatedAt` | number | 更新时间 |

## posts

校园广场/校园墙帖子。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 文档 ID |
| `_openid` | string | 发布者 openid |
| `authorId` | string | 发布者用户 ID |
| `nickname` | string | 发布时展示昵称 |
| `content` | string | 正文 |
| `imageUrl` | string | 图片 fileID |
| `isAnonymous` | boolean | 是否匿名 |
| `likes` | number | 点赞数 |
| `commentCount` | number | 评论数 |
| `favoriteCount` | number | 收藏数 |
| `status` | string | `normal`、`hidden`、`deleted` |
| `createdAt` | number | 发布时间 |
| `updatedAt` | number | 更新时间 |

## comments

帖子评论。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 文档 ID |
| `_openid` | string | 评论者 openid |
| `postId` | string | 所属帖子 |
| `authorId` | string | 评论者用户 ID |
| `nickname` | string | 评论展示昵称 |
| `content` | string | 评论内容 |
| `likes` | number | 点赞数 |
| `status` | string | `normal`、`hidden`、`deleted` |
| `createdAt` | number | 评论时间 |

## post_likes

帖子点赞记录。建议后续替代 `posts.likedUsers` 数组，避免数组无限增长。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 文档 ID |
| `_openid` | string | 点赞者 openid |
| `postId` | string | 帖子 ID |
| `createdAt` | number | 点赞时间 |

## favorites

收藏记录，支持帖子和服务商品复用。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 文档 ID |
| `_openid` | string | 收藏者 openid |
| `targetType` | string | `post`、`service`、`merchant` |
| `targetId` | string | 被收藏对象 ID |
| `createdAt` | number | 收藏时间 |

## services

首页服务入口和服务配置。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 文档 ID |
| `type` | string | `canteen`、`takeaway`、`errand`、`nearby` |
| `title` | string | 服务名称 |
| `description` | string | 服务说明 |
| `coverUrl` | string | 封面图 |
| `status` | string | `online`、`offline`、`draft` |
| `sort` | number | 排序 |
| `createdAt` | number | 创建时间 |
| `updatedAt` | number | 更新时间 |

## products

点单、外卖、周边玩乐可售商品或服务项。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 文档 ID |
| `serviceType` | string | 所属服务类型 |
| `merchantId` | string | 商家 ID，可选 |
| `title` | string | 商品/服务标题 |
| `description` | string | 描述 |
| `price` | number | 价格，单位分 |
| `coverUrl` | string | 封面图 |
| `stock` | number | 库存，可选 |
| `status` | string | `online`、`offline` |
| `createdAt` | number | 创建时间 |
| `updatedAt` | number | 更新时间 |

## orders

统一订单集合。不同业务通过 `type` 区分。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 文档 ID |
| `orderNo` | string | 订单号 |
| `_openid` | string | 下单人 openid |
| `userId` | string | 下单人用户 ID |
| `type` | string | `canteen`、`takeaway`、`errand`、`nearby` |
| `status` | string | `pending`、`accepted`、`delivering`、`completed`、`cancelled` |
| `items` | array | 商品/服务明细 |
| `amount` | number | 订单金额，单位分 |
| `addressId` | string | 收货地址 ID |
| `remark` | string | 备注 |
| `runnerId` | string | 跑腿/配送人员 ID，可选 |
| `createdAt` | number | 下单时间 |
| `updatedAt` | number | 更新时间 |

## addresses

收货地址。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 文档 ID |
| `_openid` | string | 用户 openid |
| `name` | string | 收货人 |
| `phone` | string | 手机号 |
| `campusArea` | string | 校区/区域 |
| `detail` | string | 详细地址 |
| `isDefault` | boolean | 是否默认 |
| `createdAt` | number | 创建时间 |
| `updatedAt` | number | 更新时间 |

## notifications

消息中心数据源。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | string | 文档 ID |
| `_openid` | string | 接收者 openid |
| `category` | string | `interaction`、`order`、`system` |
| `title` | string | 标题 |
| `content` | string | 内容 |
| `targetType` | string | `post`、`comment`、`order`、`system` |
| `targetId` | string | 跳转对象 ID |
| `isRead` | boolean | 是否已读 |
| `createdAt` | number | 创建时间 |

## 建议索引

- `posts`: `createdAt desc`、`_openid + createdAt desc`
- `comments`: `postId + createdAt asc`
- `post_likes`: `postId + _openid`
- `favorites`: `_openid + targetType + createdAt desc`
- `orders`: `_openid + createdAt desc`、`status + createdAt desc`
- `notifications`: `_openid + category + isRead + createdAt desc`
