const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
// 获取openid
const getOpenId = async () => {
  // 获取基础信息
  const wxContext = cloud.getWXContext();
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};

// 获取小程序二维码
const getMiniProgramCode = async () => {
  // 获取小程序二维码的buffer
  const resp = await cloud.openapi.wxacode.get({
    path: "pages/index/index",
  });
  const { buffer } = resp;
  // 将图片上传云存储空间
  const upload = await cloud.uploadFile({
    cloudPath: "code.png",
    fileContent: buffer,
  });
  return upload.fileID;
};

// 创建集合
const createCollection = async (event) => {
  try {
    const { collection } = event;
    await db.createCollection(collection);
    return {
      success: true,
      data: "create collection success",
    };
  } catch (e) {
    return {
      success: true,
      data: "collection already exists or created",
    };
  }
};

// 查询数据
const selectRecord = async () => {
  // 返回数据库查询结果
  return await db.collection("sales").get();
};

// 更新数据
const updateRecord = async (event) => {
  try {
    // 遍历修改数据库信息
    for (let i = 0; i < event.data.length; i++) {
      await db
        .collection("sales")
        .where({
          _id: event.data[i]._id,
        })
        .update({
          data: {
            sales: event.data[i].sales,
          },
        });
    }
    return {
      success: true,
      data: event.data,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e,
    };
  }
};

// 新增数据
const insertRecord = async (event) => {
  try {
    const insertRecord = event.data;
    // 插入数据
    await db.collection("sales").add({
      data: {
        region: insertRecord.region,
        city: insertRecord.city,
        sales: Number(insertRecord.sales),
      },
    });
    return {
      success: true,
      data: event.data,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e,
    };
  }
};

// 删除数据
const deleteRecord = async (event) => {
  try {
    await db
      .collection("sales")
      .where({
        _id: event.data._id,
      })
      .remove();
    return {
      success: true,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e,
    };
  }
};

// const getOpenId = require('./getOpenId/index');
// const getMiniProgramCode = require('./getMiniProgramCode/index');
// const createCollection = require('./createCollection/index');
// const selectRecord = require('./selectRecord/index');
// const updateRecord = require('./updateRecord/index');
// const fetchGoodsList = require('./fetchGoodsList/index');
// const genMpQrcode = require('./genMpQrcode/index');
// 删除帖子
const deletePost = async (event) => {
  try {
    const { id } = event;
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;

    // 先查询帖子，核实身份
    const postRes = await db.collection("posts").doc(id).get().catch(() => null);
    if (!postRes || !postRes.data) {
      return {
        success: false,
        errMsg: "帖子不存在",
      };
    }

    if (postRes.data._openid !== openid) {
      return {
        success: false,
        errMsg: "无权删除他人帖子",
      };
    }

    await db.collection("posts").doc(id).remove();
    return {
      success: true,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e.message,
    };
  }
};

// 点赞帖子
const likePost = async (event) => {
  try {
    const { id } = event;
    await db
      .collection("posts")
      .doc(id)
      .update({
        data: {
          likes: db.command.inc(1),
        },
      });
    return {
      success: true,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e.message,
    };
  }
};

// 云函数入口函数
exports.main = async (event, context) => {
  console.log("云函数收到请求:", event);
  const db = cloud.database();

  switch (event.type) {
    case "getOpenId":
      return await getOpenId();
    case "getMiniProgramCode":
      return await getMiniProgramCode();
    case "createCollection":
      return await createCollection(event);
    case "selectRecord":
      return await selectRecord();
    case "updateRecord":
      return await updateRecord(event);
    case "insertRecord":
      return await insertRecord(event);
    case "deleteRecord":
      return await deleteRecord(event);
    case "likePost":
      try {
        const { id } = event;
        const wxContext = cloud.getWXContext();
        const openid = wxContext.OPENID;
        if (!id) return { success: false, errMsg: "帖子ID缺失" };

        const _ = db.command;
        // 先查询帖子，判断用户是否已点赞
        const post = await db.collection("posts").doc(id).get().catch(() => null);
        if (!post) return { success: false, errMsg: "帖子不存在" };

        const likedUsers = post.data.likedUsers || [];
        const isLiked = likedUsers.includes(openid);

        if (isLiked) {
          // 如果已点赞，则取消点赞：减少计数值，并从数组中移除 openid
          await db
            .collection("posts")
            .doc(id)
            .update({
              data: {
                likes: _.inc(-1),
                likedUsers: _.pull(openid),
              },
            });
          return { success: true, action: "unliked" };
        } else {
          // 如果未点赞，则点赞：增加计数值，并向数组中添加 openid
          await db
            .collection("posts")
            .doc(id)
            .update({
              data: {
                likes: _.inc(1),
                likedUsers: _.addToSet(openid),
              },
            });
          return { success: true, action: "liked" };
        }
      } catch (e) {
        return { success: false, errMsg: e.message };
      }
    case "deletePost":
      try {
        const { id } = event;
        const wxContext = cloud.getWXContext();
        const openid = wxContext.OPENID;

        const postRes = await db
          .collection("posts")
          .doc(id)
          .get()
          .catch(() => null);
        if (!postRes || !postRes.data) {
          return { success: false, errMsg: "帖子不存在" };
        }

        if (postRes.data._openid !== openid) {
          return { success: false, errMsg: "无权删除他人帖子" };
        }

        await db.collection("posts").doc(id).remove();
        // 同步删除该帖子下的所有评论
        await db
          .collection("comments")
          .where({
            postId: id,
          })
          .remove();

        return { success: true };
      } catch (e) {
        return { success: false, errMsg: e.message };
      }
    case "addComment":
      try {
        const { postId, content, nickname } = event;
        const wxContext = cloud.getWXContext();
        const openid = wxContext.OPENID;

        await db.collection("comments").add({
          data: {
            postId,
            content,
            nickname,
            _openid: openid,
            timestamp: Date.now(),
            likes: 0,
            likedUsers: [],
          },
        });
        return { success: true };
      } catch (e) {
        return { success: false, errMsg: e.message };
      }
    case "likeComment":
      try {
        const { id } = event;
        const wxContext = cloud.getWXContext();
        const openid = wxContext.OPENID;

        const _ = db.command;
        const comment = await db.collection("comments").doc(id).get().catch(() => null);
        if (!comment) return { success: false, errMsg: "评论不存在" };

        const isLiked = (comment.data.likedUsers || []).includes(openid);

        if (isLiked) {
          await db
            .collection("comments")
            .doc(id)
            .update({
              data: {
                likes: _.inc(-1),
                likedUsers: _.pull(openid),
              },
            });
        } else {
          await db
            .collection("comments")
            .doc(id)
            .update({
              data: {
                likes: _.inc(1),
                likedUsers: _.addToSet(openid),
              },
            });
        }
        return { success: true };
      } catch (e) {
        return { success: false, errMsg: e.message };
      }
    case "deleteComment":
      try {
        const { id } = event;
        const wxContext = cloud.getWXContext();
        const openid = wxContext.OPENID;

        const comment = await db.collection("comments").doc(id).get().catch(() => null);
        if (!comment) return { success: false, errMsg: "评论不存在" };

        if (comment.data._openid !== openid) {
          return { success: false, errMsg: "无权删除他人评论" };
        }

        await db.collection("comments").doc(id).remove();
        return { success: true };
      } catch (e) {
        return { success: false, errMsg: e.message };
      }
  }
};
