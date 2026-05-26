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
  "announcements",
];

const ok = (data = null) => ({ success: true, data });
const fail = (errMsg = "request failed") => ({ success: false, errMsg });
const now = () => Date.now();

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

async function getOpenId() {
  return ok(getContext());
}

async function getCurrentUserInfo() {
  const context = requireOpenId();
  const user = await getCurrentUser(context.openid);
  return ok({
    ...context,
    user,
  });
}

async function upsertUser(event) {
  const { openid } = requireOpenId();
  const profile = event.profile || {};
  const time = now();
  const data = {
    ...pick(profile, ["nickName", "avatarUrl", "campus", "phone"]),
    role: profile.role || "student",
    status: "active",
    studentVerified: !!profile.studentVerified,
    updatedAt: time,
  };

  const userRes = await db.collection("users").where({ _openid: openid }).limit(1).get();
  if (userRes.data.length) {
    const user = userRes.data[0];
    await db.collection("users").doc(user._id).update({ data });
    return ok({ ...user, ...data });
  }

  const addRes = await db.collection("users").add({
    data: {
      ...data,
      createdAt: time,
    },
  });
  return ok({ _id: addRes._id, _openid: openid, ...data, createdAt: time });
}

async function getCurrentUser(openid) {
  const res = await db.collection("users").where({ _openid: openid }).limit(1).get();
  return res.data[0] || null;
}

async function listPosts(event) {
  requireOpenId();
  const page = Math.max(Number(event.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(event.pageSize || 20), 1), 50);
  const where = { status: "published" };
  if (event.tag && event.tag !== "all") where.tag = event.tag;

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
  if (postRes.data._openid !== openid) return fail("permission denied");

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
  const time = now();
  const data = {
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

  await db.collection("interactions").add({
    data: {
      targetType,
      targetId,
      interactionType,
      createdAt: now(),
    },
  });
  await db.collection(collection).doc(targetId).update({ data: { [countField]: _.inc(1), updatedAt: now() } });
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

async function createOrder(event) {
  const { openid } = requireOpenId();
  const order = event.order || {};
  if (!Array.isArray(order.items) || !order.items.length) return fail("items are required");

  const time = now();
  const data = {
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
    createdAt: time,
    updatedAt: time,
  };

  const res = await db.collection("orders").add({ data });
  return ok({ _id: res._id, _openid: openid, ...data });
}

async function updateOrderStatus(event) {
  const { openid } = requireOpenId();
  const { orderId, status, statusText } = event;
  if (!orderId || !status) return fail("orderId and status are required");

  const orderRes = await db.collection("orders").doc(orderId).get().catch(() => null);
  if (!orderRes || !orderRes.data) return fail("order not found");
  if (orderRes.data._openid !== openid) return fail("permission denied");

  const time = now();
  await db.collection("orders").doc(orderId).update({
    data: {
      status,
      statusText: statusText || status,
      paid: status === "pending_pay" ? orderRes.data.paid : true,
      paymentStatus: status === "pending_pay" ? "unpaid" : orderRes.data.paymentStatus || "paid",
      updatedAt: time,
    },
  });
  await db.collection("order_logs").add({
    data: {
      orderId,
      fromStatus: orderRes.data.status,
      toStatus: status,
      note: statusText || "",
      createdAt: time,
    },
  });
  return ok({ orderId, status, statusText });
}

const handlers = {
  createCollections,
  getOpenId,
  getCurrentUser: getCurrentUserInfo,
  upsertUser,
  listPosts,
  getPost,
  createPost,
  deletePost,
  listComments,
  addComment,
  toggleInteraction,
  listMessages,
  createOrder,
  updateOrderStatus,
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
