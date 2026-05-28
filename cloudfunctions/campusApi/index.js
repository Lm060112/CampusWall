const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

const COLLECTIONS = [
  "users",
  "posts",
  "comments",
  "interactions",
  "messages",
  "orders",
  "order_logs",
  "merchants",
  "products",
  "addresses",
  "coupons",
  "coupon_records",
  "announcements",
];

const MERCHANT_SEEDS = [
  {
    id: "campus-cafe",
    sourceType: "campus",
    name: "崇明校区咖啡厅",
    tag: "校内服务",
    category: "咖啡饮品",
    status: "营业中",
    rating: "4.9",
    distance: "图书馆一楼",
    eta: "10-15分钟自取",
    sales: "今日已出 86 单",
    address: "崇明校区图书馆一楼西侧",
    notice: "下单后留意取餐通知，课间高峰建议提前 10 分钟下单。",
    coupons: ["校内自营", "自取免排队", "第二杯半价"],
    coverUrl: "/images/default-goods-image.png",
    image: "/images/default-goods-image.png",
    sort: 10,
    isHot: true,
    isNearby: false,
    products: [
      { id: "c1", category: "热销", name: "拿铁咖啡", desc: "默认热饮，可备注少冰/少糖", price: 1600, sales: "今日 36", image: "/images/default-goods-image.png", sort: 10 },
      { id: "c2", category: "热销", name: "冰美式", desc: "清爽提神，课前快速取", price: 1200, sales: "今日 42", image: "/images/default-goods-image.png", sort: 20 },
      { id: "c3", category: "咖啡", name: "燕麦拿铁", desc: "燕麦奶替换，口感更轻", price: 1800, sales: "今日 21", image: "/images/default-goods-image.png", sort: 30 },
      { id: "c4", category: "茶饮", name: "茉莉柠檬茶", desc: "清爽解腻，默认少糖", price: 1100, sales: "今日 29", image: "/images/default-goods-image.png", sort: 40 },
      { id: "c5", category: "轻食", name: "火腿芝士三明治", desc: "适合早餐和下午课间", price: 1500, sales: "今日 18", image: "/images/default-goods-image.png", sort: 50 },
    ],
  },
  {
    id: "noodle-window",
    sourceType: "campus",
    name: "一食堂面食窗口",
    tag: "食堂窗口",
    category: "食堂窗口",
    status: "营业中",
    rating: "4.8",
    distance: "一食堂二楼",
    eta: "8-12分钟自取",
    sales: "今日已出 132 单",
    address: "崇明校区一食堂二楼 03 窗口",
    notice: "午餐高峰请按取餐号取餐，堂食和打包都可备注。",
    coupons: ["食堂窗口", "出餐快", "支持打包"],
    coverUrl: "/images/default-goods-image.png",
    image: "/images/default-goods-image.png",
    sort: 20,
    isHot: true,
    isNearby: false,
    products: [
      { id: "n1", category: "热销", name: "招牌牛肉面", desc: "大块牛肉，汤底浓郁", price: 1800, sales: "今日 58", image: "/images/default-goods-image.png", sort: 10 },
      { id: "n2", category: "热销", name: "香辣鸡腿饭", desc: "微辣口味，配菜每日更新", price: 1600, sales: "今日 46", image: "/images/default-goods-image.png", sort: 20 },
      { id: "n3", category: "面食", name: "番茄鸡蛋面", desc: "酸甜口，适合清淡一点", price: 1200, sales: "今日 35", image: "/images/default-goods-image.png", sort: 30 },
      { id: "n4", category: "盖饭", name: "黑椒牛柳盖饭", desc: "黑椒香气足，默认微辣", price: 1700, sales: "今日 31", image: "/images/default-goods-image.png", sort: 40 },
      { id: "n5", category: "汤品", name: "紫菜蛋花汤", desc: "单点汤品，温热取餐", price: 500, sales: "今日 24", image: "/images/default-goods-image.png", sort: 50 },
    ],
  },
  {
    id: "takeaway-hot",
    sourceType: "takeaway",
    name: "川味小馆（崇明店）",
    tag: "川湘快餐",
    category: "川湘快餐",
    status: "营业中",
    rating: "4.8",
    distance: "1.2km",
    eta: "35分钟送达",
    sales: "月售 862",
    address: "崇明大道美食街 18 号",
    minPrice: 0,
    deliveryFee: 0,
    notice: "满 29 减 5，新客下单可使用优惠券。",
    coupons: ["新客减5元", "满29减5", "满49减10"],
    coverUrl: "/images/default-goods-image.png",
    image: "/images/default-goods-image.png",
    sort: 30,
    isHot: true,
    isNearby: true,
    products: [
      { id: "t1", category: "热销", name: "香辣鸡腿饭套餐", desc: "鸡腿饭、例汤、饮品", price: 2000, sales: "月售 189", image: "/images/default-goods-image.png", sort: 10 },
      { id: "t2", category: "热销", name: "双人下饭套餐", desc: "两荤一素，适合拼单", price: 4200, sales: "月售 96", image: "/images/default-goods-image.png", sort: 20 },
      { id: "t3", category: "套餐", name: "鱼香肉丝盖饭", desc: "酸甜微辣，配送友好", price: 1800, sales: "月售 143", image: "/images/default-goods-image.png", sort: 30 },
      { id: "t4", category: "小炒", name: "小炒黄牛肉", desc: "香辣下饭，可选微辣", price: 2800, sales: "月售 67", image: "/images/default-goods-image.png", sort: 40 },
      { id: "t5", category: "饮品", name: "冰柠檬茶", desc: "解辣搭配", price: 600, sales: "月售 120", image: "/images/default-goods-image.png", sort: 50 },
    ],
  },
];

const ANNOUNCEMENT_SEEDS = [
  {
    id: "a1",
    type: "通知",
    title: "关于秋季学期宿舍电费充值的通知",
    date: "09-06",
    content: "为保障宿舍用电稳定，请同学们在本周内完成宿舍电费充值。充值完成后可在宿舍服务台或线上入口查询余额。",
    sort: 10,
    status: "published",
  },
  {
    id: "a2",
    type: "活动",
    title: "迎新嘉年华 | 趣味打卡赢好礼",
    date: "09-05",
    content: "迎新嘉年华将在中心广场举行，现场设置集章打卡、社团展示、校园服务咨询等环节，欢迎同学们参加。",
    sort: 20,
    status: "published",
  },
];

const COUPON_SEEDS = [
  { id: "coupon-campus-5", title: "校园咖啡满减券", desc: "满 20 减 5，校内咖啡可用", amount: "¥5", amountValue: 500, threshold: 2000, scope: "campus", status: "available", sort: 10 },
  { id: "coupon-takeaway-8", title: "外卖新客券", desc: "校外外卖订单可用", amount: "¥8", amountValue: 800, threshold: 3000, scope: "takeaway", status: "available", sort: 20 },
  { id: "coupon-errand-3", title: "跑腿服务券", desc: "跑腿代取满 10 可用", amount: "¥3", amountValue: 300, threshold: 1000, scope: "errand", status: "available", sort: 30 },
  { id: "coupon-nearby-10", title: "周边活动券", desc: "活动预约可抵扣", amount: "¥10", amountValue: 1000, threshold: 5000, scope: "nearby", status: "available", sort: 40 },
];

const ok = (data = null) => ({ success: true, data });
const fail = (errMsg = "request failed") => ({ success: false, errMsg });
const now = () => Date.now();

const ROLE_PERMISSIONS = {
  student: ["read", "post:create", "order:create", "message:read"],
  runner: ["read", "post:create", "order:create", "message:read", "errand:accept"],
  merchant_staff: ["read", "post:create", "order:create", "message:read", "merchant:manage", "product:manage"],
  admin: ["*"],
};

function getContext() {
  const wxContext = cloud.getWXContext();
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
}

function requireOpenId() {
  const context = getContext();
  if (!context.openid) {
    throw new Error("missing openid");
  }
  return context;
}

function pick(input, keys) {
  return keys.reduce((acc, key) => {
    if (input[key] !== undefined) acc[key] = input[key];
    return acc;
  }, {});
}

async function createCollections() {
  const results = [];
  for (const name of COLLECTIONS) {
    try {
      await db.createCollection(name);
      results.push({ name, created: true });
    } catch (error) {
      results.push({ name, created: false, message: "already exists or no permission" });
    }
  }
  return ok(results);
}

async function upsertByBizId(collectionName, id, data) {
  const collection = db.collection(collectionName);
  const existed = await collection.where({ id }).limit(1).get();
  if (existed.data.length) {
    await collection.doc(existed.data[0]._id).update({
      data: {
        ...data,
        updatedAt: now(),
      },
    });
    return existed.data[0]._id;
  }
  const res = await collection.add({
    data: {
      id,
      ...data,
      createdAt: now(),
      updatedAt: now(),
    },
  });
  return res._id;
}

async function seedBaseData() {
  requireOpenId();
  for (const merchant of MERCHANT_SEEDS) {
    const { products, ...merchantData } = merchant;
    await upsertByBizId("merchants", merchant.id, {
      ...merchantData,
      status: merchant.status || "营业中",
    });
    for (const product of products) {
      await upsertByBizId("products", product.id, {
        ...product,
        merchantId: merchant.id,
        sourceType: merchant.sourceType,
        status: "active",
      });
    }
  }
  for (const announcement of ANNOUNCEMENT_SEEDS) {
    await upsertByBizId("announcements", announcement.id, announcement);
  }
  for (const coupon of COUPON_SEEDS) {
    await upsertByBizId("coupons", coupon.id, {
      ...coupon,
      enabled: true,
    });
  }
  return ok({
    merchants: MERCHANT_SEEDS.length,
    products: MERCHANT_SEEDS.reduce((sum, item) => sum + item.products.length, 0),
    announcements: ANNOUNCEMENT_SEEDS.length,
    coupons: COUPON_SEEDS.length,
  });
}

async function ensureBaseDataSeeded() {
  const existed = await db.collection("merchants").where({ id: "campus-cafe" }).limit(1).get().catch(() => ({ data: [] }));
  if (!existed.data.length) {
    await seedBaseData();
  }
}

async function getOpenId() {
  return ok(getContext());
}

async function getCurrentUserInfo() {
  const context = requireOpenId();
  const user = await getCurrentUser(context.openid);
  return ok({
    ...context,
    user: attachPermissions(user),
  });
}

async function getCurrentUser(openid) {
  const res = await db.collection("users").where({ _openid: openid }).limit(1).get();
  return res.data[0] || null;
}

function attachPermissions(user) {
  if (!user) return null;
  const role = user.role || "student";
  return {
    ...user,
    role,
    permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.student,
  };
}

async function requireRole(openid, roles) {
  const user = await getCurrentUser(openid);
  const role = user && user.role ? user.role : "student";
  if (!roles.includes(role) && role !== "admin") {
    throw new Error("permission denied");
  }
  return attachPermissions(user || { _openid: openid, role });
}

async function requirePostOwnerOrRole(openid, post, roles = []) {
  if (post && post._openid === openid) return true;
  await requireRole(openid, roles);
  return true;
}

async function requireOrderOwnerOrRole(openid, order, roles = []) {
  if (order && order._openid === openid) return true;
  await requireRole(openid, roles);
  return true;
}

async function upsertUser(event) {
  const { openid } = requireOpenId();
  const profile = event.profile || {};
  const time = now();
  const baseData = {
    _openid: openid,
    ...pick(profile, ["nickName", "avatarUrl", "campus", "phone"]),
    status: "active",
    updatedAt: time,
  };

  const userRes = await db.collection("users").where({ _openid: openid }).limit(1).get();
  if (userRes.data.length) {
    const user = userRes.data[0];
    const data = {
      ...baseData,
      role: user.role || "student",
      studentVerified: !!user.studentVerified,
    };
    await db.collection("users").doc(user._id).update({ data });
    return ok(attachPermissions({ ...user, ...data }));
  }

  const data = {
    ...baseData,
    role: "student",
    studentVerified: false,
  };
  const addRes = await db.collection("users").add({
    data: {
      ...data,
      createdAt: time,
    },
  });
  return ok(attachPermissions({ _id: addRes._id, _openid: openid, ...data, createdAt: time }));
}

async function listPosts(event) {
  const { openid } = requireOpenId();
  const page = Math.max(Number(event.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(event.pageSize || 20), 1), 50);
  const where = { status: "published" };
  if (event.tag && event.tag !== "all") where.tag = event.tag;
  if (event.mine) where._openid = openid;

  const res = await db
    .collection("posts")
    .where(where)
    .orderBy("createdAt", "desc")
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get();

  const keyword = String(event.keyword || "").trim().toLowerCase();
  const data = keyword
    ? res.data.filter((post) => `${post.authorName}${post.tagText}${post.topic}${post.content}${post.location}`.toLowerCase().includes(keyword))
    : res.data;

  return ok({ list: data, page, pageSize });
}

async function listMyPosts(event) {
  const { openid } = requireOpenId();
  const mode = event.mode === "favorites" ? "favorites" : "published";
  const page = Math.max(Number(event.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(event.pageSize || 50), 1), 100);

  if (mode === "favorites") {
    const interactionsRes = await db
      .collection("interactions")
      .where({ _openid: openid, targetType: "post", interactionType: "favorite" })
      .orderBy("createdAt", "desc")
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();
    const list = [];
    for (const item of interactionsRes.data) {
      const postRes = await db.collection("posts").doc(item.targetId).get().catch(() => null);
      if (postRes && postRes.data && postRes.data.status !== "deleted") list.push(postRes.data);
    }
    return ok({ list, page, pageSize });
  }

  const postsRes = await db
    .collection("posts")
    .where({ _openid: openid, status: "published" })
    .orderBy("createdAt", "desc")
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get();
  return ok({ list: postsRes.data, page, pageSize });
}

async function getPost(event) {
  requireOpenId();
  const id = event.id;
  if (!id) return fail("post id is required");

  const postRes = await db.collection("posts").doc(id).get().catch(() => null);
  if (!postRes || !postRes.data || postRes.data.status === "deleted") {
    return fail("post not found");
  }

  await db.collection("posts").doc(id).update({
    data: {
      viewCount: _.inc(1),
      updatedAt: now(),
    },
  }).catch(() => null);

  return ok({
    ...postRes.data,
    viewCount: Number(postRes.data.viewCount || 0) + 1,
  });
}

async function createPost(event) {
  const { openid } = requireOpenId();
  const user = await getCurrentUser(openid);
  const payload = event.post || {};
  const content = String(payload.content || "").trim();
  if (!content) return fail("content is required");

  const tag = payload.tag || "help";
  const tagTextMap = {
    idle: "闲置",
    help: "求助",
    carpool: "拼车",
    activity: "活动",
  };
  const time = now();

  const data = {
    _openid: openid,
    authorId: user ? user._id : "",
    authorName: payload.authorName || (user && user.nickName) || "校园用户",
    authorAvatar: payload.authorAvatar || (user && user.avatarUrl) || "/images/avatar.png",
    tag,
    tagText: payload.tagText || tagTextMap[tag] || "求助",
    topic: payload.topic || "",
    content,
    images: Array.isArray(payload.images) ? payload.images.slice(0, 9) : [],
    location: payload.location || "",
    price: Number(payload.price || 0),
    routeText: payload.routeText || "",
    departTime: payload.departTime || "",
    seats: Number(payload.seats || 0),
    eventTitle: payload.eventTitle || "",
    eventTime: payload.eventTime || "",
    likeCount: 0,
    commentCount: 0,
    favoriteCount: 0,
    viewCount: 0,
    status: "published",
    createdAt: time,
    updatedAt: time,
  };

  const res = await db.collection("posts").add({ data });
  return ok({ _id: res._id, _openid: openid, ...data });
}

async function deletePost(event) {
  const { openid } = requireOpenId();
  const id = event.id;
  if (!id) return fail("post id is required");

  const postRes = await db.collection("posts").doc(id).get().catch(() => null);
  if (!postRes || !postRes.data) return fail("post not found");
  await requirePostOwnerOrRole(openid, postRes.data, ["admin"]);

  await db.collection("posts").doc(id).update({
    data: {
      status: "deleted",
      updatedAt: now(),
    },
  });
  return ok({ id });
}

async function listComments(event) {
  requireOpenId();
  const postId = event.postId;
  if (!postId) return fail("postId is required");

  const res = await db
    .collection("comments")
    .where({ postId, status: "published" })
    .orderBy("createdAt", "asc")
    .limit(Math.min(Number(event.pageSize || 100), 100))
    .get();

  return ok(res.data);
}

async function addComment(event) {
  const { openid } = requireOpenId();
  const postId = event.postId;
  const content = String(event.content || "").trim();
  if (!postId) return fail("postId is required");
  if (!content) return fail("content is required");

  const user = await getCurrentUser(openid);
  const postRes = await db.collection("posts").doc(postId).get().catch(() => null);
  if (!postRes || !postRes.data || postRes.data.status === "deleted") return fail("post not found");
  const time = now();
  const data = {
    _openid: openid,
    postId,
    authorId: user ? user._id : "",
    authorName: event.authorName || (user && user.nickName) || "校园用户",
    authorAvatar: event.authorAvatar || (user && user.avatarUrl) || "/images/avatar.png",
    content,
    likeCount: 0,
    status: "published",
    createdAt: time,
  };

  const res = await db.collection("comments").add({ data });
  await db.collection("posts").doc(postId).update({
    data: {
      commentCount: _.inc(1),
      updatedAt: time,
    },
  });
  if (postRes.data._openid && postRes.data._openid !== openid) {
    await addInteractionMessage(postRes.data._openid, {
      targetId: postId,
      title: `${data.authorName} 评论了你的动态`,
      content,
      icon: data.authorAvatar,
      badgeIcon: "comment",
    });
  }

  return ok({ _id: res._id, _openid: openid, ...data });
}

async function toggleInteraction(event) {
  const { openid } = requireOpenId();
  const targetType = event.targetType || "post";
  const targetId = event.targetId;
  const interactionType = event.interactionType || "like";
  if (!targetId) return fail("targetId is required");
  if (!["like", "favorite"].includes(interactionType)) return fail("unsupported interactionType");

  const query = { _openid: openid, targetType, targetId, interactionType };
  const existed = await db.collection("interactions").where(query).limit(1).get();
  const countField = interactionType === "like" ? "likeCount" : "favoriteCount";
  const collection = targetType === "comment" ? "comments" : "posts";

  if (existed.data.length) {
    await db.collection("interactions").doc(existed.data[0]._id).remove();
    await db.collection(collection).doc(targetId).update({ data: { [countField]: _.inc(-1), updatedAt: now() } });
    return ok({ action: "removed" });
  }

  const targetRes = await db.collection(collection).doc(targetId).get().catch(() => null);

  await db.collection("interactions").add({
    data: {
      _openid: openid,
      targetType,
      targetId,
      interactionType,
      createdAt: now(),
    },
  });
  await db.collection(collection).doc(targetId).update({ data: { [countField]: _.inc(1), updatedAt: now() } });
  if (targetType === "post" && targetRes && targetRes.data && targetRes.data._openid && targetRes.data._openid !== openid) {
    const user = await getCurrentUser(openid);
    const actionText = interactionType === "like" ? "赞了你的动态" : "收藏了你的动态";
    await addInteractionMessage(targetRes.data._openid, {
      targetId,
      title: `${(user && user.nickName) || "校园用户"}${actionText}`,
      content: targetRes.data.content || targetRes.data.topic || "你发布的内容有了新的互动",
      icon: (user && user.avatarUrl) || "/images/avatar.png",
      badgeIcon: interactionType === "like" ? "like" : "star",
    });
  }
  return ok({ action: "added" });
}

async function listMessages(event) {
  const { openid } = requireOpenId();
  const category = event.category;
  const where = { _openid: openid };
  if (category && category !== "all") where.category = category;

  const res = await db
    .collection("messages")
    .where(where)
    .orderBy("createdAt", "desc")
    .limit(Math.min(Number(event.pageSize || 50), 100))
    .get();

  return ok(res.data);
}

async function addInteractionMessage(openid, message) {
  if (!openid) return;
  const time = now();
  await db.collection("messages").add({
    data: {
      _openid: openid,
      category: "interaction",
      type: "interaction",
      targetType: message.targetType || "post",
      targetId: message.targetId || "",
      title: message.title,
      content: message.content,
      icon: message.icon || "/images/avatar.png",
      badgeIcon: message.badgeIcon || "",
      actionText: message.actionText || "查看动态",
      targetUrl: message.targetUrl || "/pages/discover/index",
      isRead: false,
      unread: true,
      createdAt: time,
    },
  }).catch(() => null);
}

async function getMessage(event) {
  const { openid } = requireOpenId();
  const messageId = event.messageId || event.id;
  if (!messageId) return fail("messageId is required");

  const messageRes = await db.collection("messages").doc(messageId).get().catch(() => null);
  if (!messageRes || !messageRes.data) return fail("message not found");
  if (messageRes.data._openid !== openid) return fail("permission denied");

  return ok(messageRes.data);
}

async function markMessageRead(event) {
  const { openid } = requireOpenId();
  const messageId = event.messageId || event.id;
  if (!messageId) return fail("messageId is required");

  const messageRes = await db.collection("messages").doc(messageId).get().catch(() => null);
  if (!messageRes || !messageRes.data) return fail("message not found");
  if (messageRes.data._openid !== openid) return fail("permission denied");

  await db.collection("messages").doc(messageId).update({
    data: {
      isRead: true,
      unread: false,
      readAt: now(),
    },
  });
  return ok({ messageId });
}

async function markAllMessagesRead(event) {
  const { openid } = requireOpenId();
  const category = event.category;
  const where = { _openid: openid };
  if (category && category !== "all") where.category = category;

  await db.collection("messages").where(where).update({
    data: {
      isRead: true,
      unread: false,
      readAt: now(),
    },
  }).catch(() => null);
  return ok({ category: category || "all" });
}

async function getMessageSettings() {
  const { openid } = requireOpenId();
  const user = await getCurrentUser(openid);
  return ok((user && user.messageSettings) || {
    interaction: true,
    order: true,
    system: true,
    quiet: false,
  });
}

async function saveMessageSettings(event) {
  const { openid } = requireOpenId();
  const settings = {
    interaction: event.settings ? event.settings.interaction !== false : true,
    order: event.settings ? event.settings.order !== false : true,
    system: event.settings ? event.settings.system !== false : true,
    quiet: !!(event.settings && event.settings.quiet),
  };
  const time = now();
  const userRes = await db.collection("users").where({ _openid: openid }).limit(1).get();
  if (userRes.data.length) {
    await db.collection("users").doc(userRes.data[0]._id).update({
      data: { messageSettings: settings, updatedAt: time },
    });
  } else {
    await db.collection("users").add({
      data: {
        _openid: openid,
        role: "student",
        status: "active",
        studentVerified: false,
        messageSettings: settings,
        createdAt: time,
        updatedAt: time,
      },
    });
  }
  return ok(settings);
}

async function searchAll(event) {
  requireOpenId();
  await ensureBaseDataSeeded();
  const keyword = String(event.keyword || "").trim().toLowerCase();
  const activeType = event.activeType || "全部";
  const results = [
    { id: "takeaway", type: "外卖", title: "校外外卖", desc: "像普通外卖平台一样选商家、选商品、结算", url: "/pages/takeaway/index" },
    { id: "errand", type: "跑腿", title: "跑腿代取", desc: "代取快递、代买、代送需求发布", url: "/pages/errand/index" },
    { id: "nearby", type: "活动", title: "周边玩乐", desc: "周边活动、预约体验和报名", url: "/pages/nearby/index" },
    { id: "orders", type: "功能", title: "我的订单", desc: "查看订单、支付、售后和评价", url: "/pages/order/list?filter=allOrders" },
    { id: "address", type: "功能", title: "收货地址", desc: "新增、编辑和设置默认地址", url: "/pages/address/index" },
  ];

  const merchantRes = await db.collection("merchants").orderBy("sort", "asc").limit(50).get();
  merchantRes.data.forEach((item) => {
    results.push({
      id: item.id,
      type: item.sourceType === "campus" ? "校内服务" : "外卖",
      title: item.name,
      desc: `${item.tag || ""} ${item.address || ""} ${item.eta || ""}`.trim(),
      url: `/pages/merchant/detail?id=${item.id}`,
    });
  });

  const announcementRes = await db.collection("announcements").where({ status: "published" }).orderBy("sort", "asc").limit(50).get();
  announcementRes.data.forEach((item) => {
    results.push({
      id: item.id,
      type: "公告",
      title: item.title,
      desc: item.content || item.type || "",
      url: `/pages/announcement/detail/index?id=${item.id}`,
    });
  });

  const postRes = await db.collection("posts").where({ status: "published" }).orderBy("createdAt", "desc").limit(50).get().catch(() => ({ data: [] }));
  postRes.data.forEach((item) => {
    results.push({
      id: item._id,
      type: "帖子",
      title: item.topic || item.tagText || "校园墙动态",
      desc: item.content || "",
      url: `/pages/discover/detail/index?id=${item._id}`,
    });
  });

  const list = results.filter((item) => {
    const typeMatched = activeType === "全部" || item.type === activeType;
    const text = `${item.title}${item.desc}${item.type}`.toLowerCase();
    return typeMatched && (!keyword || text.includes(keyword));
  });
  return ok(list);
}

async function listMerchants(event) {
  requireOpenId();
  await ensureBaseDataSeeded();
  const where = {};
  if (event.sourceType) where.sourceType = event.sourceType;
  if (event.category && event.category !== "全部") where.category = event.category;
  if (event.isHot !== undefined) where.isHot = !!event.isHot;
  if (event.isNearby !== undefined) where.isNearby = !!event.isNearby;

  const res = await db
    .collection("merchants")
    .where(where)
    .orderBy("sort", "asc")
    .limit(Math.min(Number(event.pageSize || 50), 100))
    .get();

  return ok(res.data);
}

async function getMerchant(event) {
  requireOpenId();
  await ensureBaseDataSeeded();
  const merchantId = event.merchantId || event.id;
  if (!merchantId) return fail("merchantId is required");

  const merchantRes = await db.collection("merchants").where({ id: merchantId }).limit(1).get();
  if (!merchantRes.data.length) return fail("merchant not found");
  const merchant = merchantRes.data[0];
  const productsRes = await db
    .collection("products")
    .where({ merchantId, status: "active" })
    .orderBy("sort", "asc")
    .limit(100)
    .get();
  const products = productsRes.data;
  const categories = Array.from(new Set(products.map((item) => item.category))).filter(Boolean);

  return ok({
    scene: merchant.sourceType,
    merchant,
    products,
    categories: categories.length ? categories : ["全部"],
  });
}

async function listAnnouncements(event) {
  requireOpenId();
  await ensureBaseDataSeeded();
  const res = await db
    .collection("announcements")
    .where({ status: "published" })
    .orderBy("sort", "asc")
    .limit(Math.min(Number(event.pageSize || 20), 50))
    .get();

  return ok(res.data);
}

async function getAnnouncement(event) {
  requireOpenId();
  await ensureBaseDataSeeded();
  const announcementId = event.announcementId || event.id;
  if (!announcementId) return fail("announcementId is required");

  const res = await db.collection("announcements").where({ id: announcementId }).limit(1).get();
  if (!res.data.length) return fail("announcement not found");
  return ok(res.data[0]);
}

async function listCoupons() {
  const { openid } = requireOpenId();
  await ensureBaseDataSeeded();
  const couponRes = await db
    .collection("coupons")
    .where({ enabled: true })
    .orderBy("sort", "asc")
    .limit(100)
    .get();
  const recordRes = await db.collection("coupon_records").where({ _openid: openid }).limit(100).get().catch(() => ({ data: [] }));
  const recordMap = recordRes.data.reduce((acc, item) => {
    acc[item.couponId] = item;
    return acc;
  }, {});
  const coupons = couponRes.data.map((coupon) => {
    const record = recordMap[coupon.id];
    return {
      ...coupon,
      status: record ? record.status : "available",
      recordId: record ? record._id : "",
    };
  });
  return ok(coupons);
}

async function claimCoupon(event) {
  const { openid } = requireOpenId();
  await ensureBaseDataSeeded();
  const couponId = event.couponId || event.id;
  if (!couponId) return fail("couponId is required");

  const couponRes = await db.collection("coupons").where({ id: couponId, enabled: true }).limit(1).get();
  if (!couponRes.data.length) return fail("coupon not found");
  const existed = await db.collection("coupon_records").where({ _openid: openid, couponId }).limit(1).get().catch(() => ({ data: [] }));
  if (existed.data.length) return ok({ couponId, status: existed.data[0].status, recordId: existed.data[0]._id });

  const time = now();
  const res = await db.collection("coupon_records").add({
    data: {
      _openid: openid,
      couponId,
      status: "claimed",
      createdAt: time,
      updatedAt: time,
    },
  });
  return ok({ couponId, status: "claimed", recordId: res._id });
}

async function getHomeData() {
  requireOpenId();
  await ensureBaseDataSeeded();
  const merchantsRes = await db.collection("merchants").where({ isHot: true }).orderBy("sort", "asc").limit(10).get();
  const nearbyRes = await db.collection("merchants").where({ isNearby: true }).orderBy("sort", "asc").limit(1).get();
  const announcementsRes = await db.collection("announcements").where({ status: "published" }).orderBy("sort", "asc").limit(2).get();
  return ok({
    recommendations: merchantsRes.data.map((item) => ({
      id: item.id,
      name: item.name,
      badge: item.coupons && item.coupons[0] ? item.coupons[0] : item.tag,
      eta: item.eta,
      price: item.sourceType === "takeaway" ? "20" : "16",
      image: item.image || item.coverUrl || "/images/default-goods-image.png",
    })),
    nearbyMerchant: nearbyRes.data[0] || null,
    announcements: announcementsRes.data,
  });
}

async function saveMerchant(event) {
  const { openid } = requireOpenId();
  await requireRole(openid, ["admin", "merchant_staff"]);
  const merchant = event.merchant || {};
  const id = String(merchant.id || "").trim();
  const name = String(merchant.name || "").trim();
  if (!id || !name) return fail("merchant id and name are required");

  await upsertByBizId("merchants", id, {
    sourceType: merchant.sourceType || "campus",
    name,
    tag: merchant.tag || "",
    category: merchant.category || "校内服务",
    status: merchant.status || "营业中",
    rating: merchant.rating || "4.8",
    distance: merchant.distance || "",
    eta: merchant.eta || "",
    sales: merchant.sales || "",
    address: merchant.address || "",
    notice: merchant.notice || "",
    coupons: Array.isArray(merchant.coupons) ? merchant.coupons : [],
    coverUrl: merchant.coverUrl || "/images/default-goods-image.png",
    image: merchant.image || merchant.coverUrl || "/images/default-goods-image.png",
    sort: Number(merchant.sort || 99),
    isHot: !!merchant.isHot,
    isNearby: !!merchant.isNearby,
    minPrice: Number(merchant.minPrice || 0),
    deliveryFee: Number(merchant.deliveryFee || 0),
  });
  return ok({ id });
}

async function saveProduct(event) {
  const { openid } = requireOpenId();
  await requireRole(openid, ["admin", "merchant_staff"]);
  const product = event.product || {};
  const id = String(product.id || "").trim();
  const merchantId = String(product.merchantId || "").trim();
  const name = String(product.name || "").trim();
  if (!id || !merchantId || !name) return fail("product id, merchantId and name are required");

  await upsertByBizId("products", id, {
    merchantId,
    sourceType: product.sourceType || "campus",
    category: product.category || "热销",
    name,
    desc: product.desc || product.description || "",
    image: product.image || "/images/default-goods-image.png",
    price: Number(product.price || 0),
    stock: Number(product.stock || 999),
    sales: product.sales || "0",
    status: product.status || "active",
    sort: Number(product.sort || 99),
  });
  return ok({ id, merchantId });
}

async function saveAnnouncement(event) {
  const { openid } = requireOpenId();
  await requireRole(openid, ["admin"]);
  const announcement = event.announcement || {};
  const id = String(announcement.id || "").trim();
  const title = String(announcement.title || "").trim();
  if (!id || !title) return fail("announcement id and title are required");

  await upsertByBizId("announcements", id, {
    type: announcement.type || "通知",
    title,
    date: announcement.date || "",
    content: announcement.content || "",
    sort: Number(announcement.sort || 99),
    status: announcement.status || "published",
  });
  return ok({ id });
}

async function listAddresses() {
  const { openid } = requireOpenId();
  const res = await db
    .collection("addresses")
    .where({ _openid: openid, status: "active" })
    .orderBy("isDefault", "desc")
    .orderBy("updatedAt", "desc")
    .limit(50)
    .get();

  return ok(res.data);
}

async function saveAddress(event) {
  const { openid } = requireOpenId();
  const address = event.address || {};
  const name = String(address.name || "").trim();
  const phone = String(address.phone || "").trim();
  const building = String(address.building || "").trim();
  if (!name || !phone || !building) return fail("name, phone and building are required");
  if (!/^1\d{10}$/.test(phone)) return fail("phone is invalid");

  const time = now();
  const data = {
    _openid: openid,
    name,
    phone,
    campus: String(address.campus || "崇明校区").trim(),
    building,
    room: String(address.room || "").trim(),
    detail: String(address.detail || "").trim(),
    isDefault: !!address.isDefault,
    status: "active",
    updatedAt: time,
  };

  const existed = await db.collection("addresses").where({ _openid: openid, status: "active" }).limit(1).get();
  if (!existed.data.length) data.isDefault = true;
  if (data.isDefault) {
    await db.collection("addresses").where({ _openid: openid, status: "active" }).update({
      data: { isDefault: false, updatedAt: time },
    }).catch(() => null);
  }

  if (address._id || address.id) {
    const addressId = address._id || address.id;
    const addressRes = await db.collection("addresses").doc(addressId).get().catch(() => null);
    if (!addressRes || !addressRes.data) return fail("address not found");
    if (addressRes.data._openid !== openid) return fail("permission denied");
    await db.collection("addresses").doc(addressId).update({ data });
    return ok({ ...addressRes.data, ...data, _id: addressId });
  }

  const res = await db.collection("addresses").add({
    data: {
      ...data,
      createdAt: time,
    },
  });
  return ok({ _id: res._id, ...data, createdAt: time });
}

async function setDefaultAddress(event) {
  const { openid } = requireOpenId();
  const addressId = event.addressId || event.id;
  if (!addressId) return fail("addressId is required");

  const addressRes = await db.collection("addresses").doc(addressId).get().catch(() => null);
  if (!addressRes || !addressRes.data) return fail("address not found");
  if (addressRes.data._openid !== openid) return fail("permission denied");

  const time = now();
  await db.collection("addresses").where({ _openid: openid, status: "active" }).update({
    data: { isDefault: false, updatedAt: time },
  }).catch(() => null);
  await db.collection("addresses").doc(addressId).update({
    data: { isDefault: true, updatedAt: time },
  });

  return ok({ addressId });
}

async function deleteAddress(event) {
  const { openid } = requireOpenId();
  const addressId = event.addressId || event.id;
  if (!addressId) return fail("addressId is required");

  const addressRes = await db.collection("addresses").doc(addressId).get().catch(() => null);
  if (!addressRes || !addressRes.data) return fail("address not found");
  if (addressRes.data._openid !== openid) return fail("permission denied");

  const time = now();
  await db.collection("addresses").doc(addressId).update({
    data: { status: "deleted", isDefault: false, updatedAt: time },
  });

  if (addressRes.data.isDefault) {
    const nextDefault = await db.collection("addresses")
      .where({ _openid: openid, status: "active" })
      .orderBy("updatedAt", "desc")
      .limit(1)
      .get();
    if (nextDefault.data.length) {
      await db.collection("addresses").doc(nextDefault.data[0]._id).update({
        data: { isDefault: true, updatedAt: time },
      });
    }
  }

  return ok({ addressId });
}

function getOrderStatusText(status, sourceType) {
  const common = {
    pending_pay: "待付款",
    completed: "订单已完成",
    refund_pending: "售后处理中",
    refunded: "已退款",
  };
  const sourceMap = {
    campus: { preparing: "制作中", ready: "待取餐" },
    takeaway: { preparing: "商家备餐中", delivering: "配送中" },
    errand: { waiting: "等待接单", processing: "跑腿处理中" },
    nearby: { reserved: "预约成功", active: "待参加" },
  };
  return common[status] || (sourceMap[sourceType] && sourceMap[sourceType][status]) || status;
}

function getOrderMessage(status, order) {
  const merchantName = order.merchant && order.merchant.name ? order.merchant.name : "订单";
  const pickupNo = order.pickupNo ? `，取餐号 ${order.pickupNo}` : "";
  const messages = {
    pending_pay: { title: "订单已创建", content: `${merchantName} 已生成订单，请完成支付${pickupNo}` },
    preparing: { title: "订单已支付", content: `${merchantName} 已收到订单，正在处理中${pickupNo}` },
    ready: { title: "餐品已备好", content: `${merchantName} 已备好，请及时领取${pickupNo}` },
    delivering: { title: "订单配送中", content: `${merchantName} 的订单正在配送中，请留意取餐点` },
    processing: { title: "跑腿已接单", content: `${merchantName} 正在处理中，请保持联系` },
    reserved: { title: "预约成功", content: `${merchantName} 已预约成功，请按时参加` },
    active: { title: "活动即将开始", content: `${merchantName} 即将开始，请按时到达` },
    completed: { title: "订单已完成", content: `你在 ${merchantName} 的订单已完成` },
    refund_pending: { title: "售后申请已提交", content: `${merchantName} 的售后申请已提交，请等待处理` },
    refunded: { title: "退款成功", content: `${merchantName} 的退款已处理完成` },
  };
  return messages[status] || {
    title: getOrderStatusText(status, order.sourceType),
    content: `${merchantName} 状态已更新为 ${getOrderStatusText(status, order.sourceType)}`,
  };
}

async function addOrderLog(orderId, openid, fromStatus, toStatus, note, time) {
  await db.collection("order_logs").add({
    data: {
      orderId,
      _openid: openid,
      fromStatus: fromStatus || "",
      toStatus,
      note: note || "",
      createdAt: time,
    },
  }).catch(() => null);
}

async function addOrderMessage(orderId, status, order, time) {
  const message = getOrderMessage(status, order);
  await db.collection("messages").add({
    data: {
      _openid: order._openid || "",
      category: "order",
      type: "order",
      targetType: "order",
      targetId: orderId,
      orderId,
      title: message.title,
      content: message.content,
      status,
      statusClass: status === "completed" || status === "refunded" ? "done" : "processing",
      icon: order.merchant && order.merchant.image ? order.merchant.image : "/images/default-goods-image.png",
      isRead: false,
      unread: true,
      createdAt: time,
    },
  }).catch(() => null);
}

async function createOrder(event) {
  const { openid } = requireOpenId();
  const order = event.order || {};
  if (!Array.isArray(order.items) || !order.items.length) return fail("items are required");

  const time = now();
  const data = {
    _openid: openid,
    orderNo: `CW${time}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
    sourceType: order.sourceType || "campus",
    merchantId: order.merchantId || "",
    merchant: order.merchant || {},
    items: order.items,
    totalAmount: Number(order.totalAmount || 0),
    paid: false,
    paymentStatus: "unpaid",
    status: "pending_pay",
    statusText: "待付款",
    contact: order.contact || null,
    remark: order.remark || "",
    pickupNo: order.pickupNo || `A${String(time).slice(-3)}`,
    pickupType: order.pickupType || "",
    payMethod: "",
    payTime: 0,
    createdAt: time,
    updatedAt: time,
  };

  const res = await db.collection("orders").add({ data });
  await addOrderLog(res._id, openid, "", "pending_pay", "订单已创建", time);
  await addOrderMessage(res._id, "pending_pay", data, time);
  return ok({ _id: res._id, _openid: openid, ...data });
}

async function listOrders(event) {
  const { openid } = requireOpenId();
  const page = Math.max(Number(event.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(event.pageSize || 50), 1), 100);
  const where = { _openid: openid };
  if (event.status) where.status = event.status;

  const res = await db
    .collection("orders")
    .where(where)
    .orderBy("createdAt", "desc")
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get();

  return ok({ list: res.data, page, pageSize });
}

async function getOrder(event) {
  const { openid } = requireOpenId();
  const orderId = event.orderId || event.id;
  if (!orderId) return fail("orderId is required");

  const orderRes = await db.collection("orders").doc(orderId).get().catch(() => null);
  if (!orderRes || !orderRes.data) return fail("order not found");
  if (orderRes.data._openid !== openid) return fail("permission denied");

  return ok(orderRes.data);
}

async function updateOrderStatus(event) {
  const { openid } = requireOpenId();
  const { orderId, status, statusText, payMethod } = event;
  if (!orderId || !status) return fail("orderId and status are required");

  const orderRes = await db.collection("orders").doc(orderId).get().catch(() => null);
  if (!orderRes || !orderRes.data) return fail("order not found");
  await requireOrderOwnerOrRole(openid, orderRes.data, ["admin", "merchant_staff", "runner"]);

  const time = now();
  const nextStatusText = statusText || getOrderStatusText(status, orderRes.data.sourceType);
  const nextPaymentStatus = status === "pending_pay" ? "unpaid" : (status === "refunded" ? "refunded" : "paid");
  const nextPaid = status === "pending_pay" ? false : status !== "refunded";
  const updateData = {
    status,
    statusText: nextStatusText,
    paid: nextPaid,
    paymentStatus: nextPaymentStatus,
    updatedAt: time,
  };
  if (payMethod) {
    updateData.payMethod = payMethod;
    updateData.payTime = time;
  }

  await db.collection("orders").doc(orderId).update({ data: updateData });
  const nextOrder = { ...orderRes.data, ...updateData };
  await addOrderLog(orderId, openid, orderRes.data.status, status, nextStatusText, time);
  await addOrderMessage(orderId, status, nextOrder, time);
  return ok({ orderId, ...nextOrder });
}

async function submitOrderReview(event) {
  const { openid } = requireOpenId();
  const { orderId } = event;
  const review = event.review || {};
  if (!orderId) return fail("orderId is required");

  const orderRes = await db.collection("orders").doc(orderId).get().catch(() => null);
  if (!orderRes || !orderRes.data) return fail("order not found");
  if (orderRes.data._openid !== openid) return fail("permission denied");

  const time = now();
  const data = {
    rating: Math.min(Math.max(Number(review.rating || 5), 1), 5),
    tags: Array.isArray(review.tags) ? review.tags : [],
    content: String(review.content || "整体体验不错").trim(),
    images: Array.isArray(review.images) ? review.images.slice(0, 3) : [],
    createdAt: time,
  };
  await db.collection("orders").doc(orderId).update({
    data: {
      review: data,
      status: "completed",
      statusText: "订单已完成",
      updatedAt: time,
    },
  });
  await addOrderLog(orderId, openid, orderRes.data.status, "completed", "用户已评价", time);
  return ok({ orderId, review: data });
}

async function requestOrderRefund(event) {
  const { openid } = requireOpenId();
  const { orderId } = event;
  const refund = event.refund || {};
  if (!orderId) return fail("orderId is required");

  const orderRes = await db.collection("orders").doc(orderId).get().catch(() => null);
  if (!orderRes || !orderRes.data) return fail("order not found");
  if (orderRes.data._openid !== openid) return fail("permission denied");

  const time = now();
  const data = {
    reason: String(refund.reason || "不想要了"),
    desc: String(refund.desc || ""),
    images: Array.isArray(refund.images) ? refund.images.slice(0, 3) : [],
    status: "售后中",
    createdAt: time,
  };
  await db.collection("orders").doc(orderId).update({
    data: {
      refund: data,
      status: "refund_pending",
      statusText: "退款申请已提交",
      updatedAt: time,
    },
  });
  const nextOrder = { ...orderRes.data, refund: data, status: "refund_pending", statusText: "退款申请已提交" };
  await addOrderLog(orderId, openid, orderRes.data.status, "refund_pending", "用户提交售后申请", time);
  await addOrderMessage(orderId, "refund_pending", nextOrder, time);
  return ok({ orderId, refund: data });
}

async function listUsers(event) {
  const { openid } = requireOpenId();
  await requireRole(openid, ["admin"]);

  const page = Math.max(Number(event.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(event.pageSize || 50), 1), 100);
  const where = {};
  if (event.role) where.role = event.role;
  if (event.status) where.status = event.status;

  const res = await db
    .collection("users")
    .where(where)
    .orderBy("updatedAt", "desc")
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get();

  return ok(res.data.map(attachPermissions));
}

async function updateUserRole(event) {
  const { openid } = requireOpenId();
  await requireRole(openid, ["admin"]);

  const userId = event.userId || event.id;
  const role = event.role;
  if (!userId) return fail("userId is required");
  if (!ROLE_PERMISSIONS[role]) return fail("invalid role");

  const userRes = await db.collection("users").doc(userId).get().catch(() => null);
  if (!userRes || !userRes.data) return fail("user not found");

  const data = {
    role,
    updatedAt: now(),
  };
  await db.collection("users").doc(userId).update({ data });
  return ok(attachPermissions({ ...userRes.data, ...data }));
}

const handlers = {
  createCollections,
  seedBaseData,
  getOpenId,
  getCurrentUser: getCurrentUserInfo,
  upsertUser,
  listPosts,
  listMyPosts,
  getPost,
  createPost,
  deletePost,
  listComments,
  addComment,
  toggleInteraction,
  listMessages,
  getMessage,
  markMessageRead,
  markAllMessagesRead,
  getMessageSettings,
  saveMessageSettings,
  searchAll,
  listMerchants,
  getMerchant,
  listAnnouncements,
  getAnnouncement,
  listCoupons,
  claimCoupon,
  getHomeData,
  saveMerchant,
  saveProduct,
  saveAnnouncement,
  listAddresses,
  saveAddress,
  setDefaultAddress,
  deleteAddress,
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
  submitOrderReview,
  requestOrderRefund,
  listUsers,
  updateUserRole,
};

exports.main = async (event = {}) => {
  const action = event.action || event.type;
  if (!handlers[action]) return fail(`unknown action: ${action}`);

  try {
    return await handlers[action](event);
  } catch (error) {
    console.error(error);
    return fail(error.message || String(error));
  }
};
