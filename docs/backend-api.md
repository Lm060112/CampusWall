# campusApi 后端接口文档

所有接口通过云函数 `campusApi` 调用：

```js
wx.cloud.callFunction({
  name: "campusApi",
  data: {
    action: "接口名"
  }
})
```

## 用户与权限

| action | 说明 | 权限 |
| --- | --- | --- |
| `getOpenId` | 获取当前 OpenID | 登录用户 |
| `getCurrentUser` | 获取当前用户与角色权限 | 登录用户 |
| `upsertUser` | 创建/更新当前用户资料 | 登录用户 |
| `listUsers` | 用户列表 | admin |
| `updateUserRole` | 修改用户角色 | admin |

## 首页与运营数据

| action | 说明 | 权限 |
| --- | --- | --- |
| `getHomeData` | 首页推荐、商家、公告聚合 | 登录用户 |
| `listMerchants` | 商家/校内服务列表 | 登录用户 |
| `getMerchant` | 商家详情与商品 | 登录用户 |
| `listProducts` | 商品管理列表 | admin / merchant_staff |
| `saveMerchant` | 新增/编辑商家 | admin / merchant_staff |
| `saveProduct` | 新增/编辑商品 | admin / merchant_staff |
| `listAnnouncements` | 公告列表 | 登录用户 |
| `getAnnouncement` | 公告详情 | 登录用户 |
| `saveAnnouncement` | 新增/编辑公告 | admin |

## 订单

| action | 说明 | 权限 |
| --- | --- | --- |
| `createOrder` | 创建订单 | 登录用户 |
| `listOrders` | 我的订单；`manage:true` 时为管理列表 | 本人 / 管理角色 |
| `getOrder` | 订单详情 | 本人 / 管理角色 |
| `updateOrderStatus` | 修改订单状态 | 本人 / admin / merchant_staff / runner |
| `submitOrderReview` | 提交评价 | 本人 |
| `requestOrderRefund` | 申请售后/退款 | 本人 |

## 校园墙

| action | 说明 | 权限 |
| --- | --- | --- |
| `listPosts` | 帖子列表 | 登录用户 |
| `getPost` | 帖子详情 | 登录用户 |
| `createPost` | 发布帖子 | 登录用户 |
| `deletePost` | 删除帖子 | 本人 / admin |
| `listComments` | 评论列表 | 登录用户 |
| `addComment` | 新增评论 | 登录用户 |
| `toggleInteraction` | 点赞/收藏 | 登录用户 |
| `reportContent` | 举报帖子/评论 | 登录用户 |
| `listReports` | 举报列表 | admin |
| `resolveReport` | 处理举报 | admin |
| `listManagePosts` | 审核用帖子列表 | admin |
| `moderatePost` | 隐藏/恢复/删除帖子 | admin |

## 学生认证

| action | 说明 | 权限 |
| --- | --- | --- |
| `submitVerification` | 提交认证申请 | 登录用户 |
| `listVerificationRequests` | 认证申请列表 | admin |
| `reviewVerification` | 审核认证 | admin |

## 管理后台

| action | 说明 | 权限 |
| --- | --- | --- |
| `getAdminDashboard` | 管理总览数据 | admin / merchant_staff / runner |
| `listAdminLogs` | 管理员操作日志 | admin |

## 约定

- 金额统一使用“分”。
- 前端不应直接写核心集合，写操作尽量走云函数。
- 角色字段 `users.role` 只能通过 `updateUserRole` 或数据库管理员手动修改。
- 上线前需要配置云数据库权限规则，避免绕过云函数。
