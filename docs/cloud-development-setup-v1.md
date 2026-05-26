# 云开发接入步骤 V1

这份清单用于把当前前端模拟项目逐步接入微信云开发。当前仓库已经新增 `cloudfunctions/campusApi` 云函数骨架，但还没有绑定你的真实云环境。

## 你需要先准备

1. 微信开发者工具可以正常打开当前项目。
2. 小程序 AppID 使用当前项目 AppID。
3. 在微信开发者工具顶部点击“云开发”，开通云开发环境。
4. 记录云环境 ID，例如 `cloud1-xxxxxx`。

## 配置 envList

打开 `miniprogram/envList.js`，把空数组改成你的云环境：

```js
const envList = [
  {
    envId: "你的云环境ID",
    alias: "dev",
  },
];
const isMac = false;
module.exports = {
  envList,
  isMac,
};
```

如果你暂时还没有云环境，可以先不改，前端仍然使用本地模拟数据。

## 第一阶段创建集合

在云开发控制台的“数据库”里先创建：

- `users`
- `posts`
- `comments`
- `interactions`

可选提前创建：

- `messages`
- `orders`
- `order_logs`
- `merchants`
- `products`
- `addresses`
- `coupons`
- `announcements`

## 第一阶段权限建议

为了安全，建议先使用云函数写入，不让前端随便直接写数据库。

推荐：

- `posts`：所有用户可读，仅云函数可写。
- `comments`：所有用户可读，仅云函数可写。
- `users`：仅创建者可读写。
- `interactions`：仅创建者可读写。
- 订单、商家、商品集合先不开放写权限。

如果微信开发者工具里权限配置比较难理解，可以先选择“仅创建者可读写”，再通过云函数完成读写。

## 部署 campusApi 云函数

在微信开发者工具中：

1. 找到 `cloudfunctions/campusApi`。
2. 右键选择“上传并部署：云端安装依赖”。
3. 部署成功后，在云函数测试里传入：

```json
{
  "action": "getOpenId"
}
```

预期返回：

```json
{
  "success": true,
  "data": {
    "openid": "...",
    "appid": "..."
  }
}
```

## campusApi 已设计的动作

| action | 作用 |
| --- | --- |
| `getOpenId` | 获取当前微信用户 openid |
| `upsertUser` | 创建或更新当前用户资料 |
| `listPosts` | 获取校园墙帖子列表 |
| `createPost` | 发布帖子 |
| `deletePost` | 软删除自己的帖子 |
| `listComments` | 获取帖子评论 |
| `addComment` | 新增评论 |
| `toggleInteraction` | 点赞/取消点赞、收藏/取消收藏 |
| `listMessages` | 获取当前用户消息 |
| `createOrder` | 创建订单草稿，后续接支付前使用 |
| `updateOrderStatus` | 更新订单状态 |
| `createCollections` | 辅助创建集合，开发期使用 |

## 前端接入建议

不要一次性把所有页面都改成云数据库。建议顺序：

1. 登录页先接 `upsertUser`。
2. 发现页列表接 `listPosts`，保留本地模拟数据作为失败兜底。
3. 发布动态接 `createPost`。
4. 帖子详情评论接 `listComments`、`addComment`。
5. 点赞/收藏接 `toggleInteraction`。
6. 订单仍先保留本地模拟，等校园墙稳定后再接 `orders`。

## 验证方式

1. 云函数测试 `getOpenId` 能返回 openid。
2. 云函数测试 `createPost` 能在 `posts` 集合新增一条记录。
3. 云函数测试 `listPosts` 能读到刚才的记录。
4. 云函数测试 `addComment` 后，`comments` 有记录，并且 `posts.commentCount` 增加。
5. 云函数测试 `toggleInteraction` 后，`interactions` 有记录，并且 `posts.likeCount` 或 `favoriteCount` 变化。
