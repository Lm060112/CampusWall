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
const createCollection = async () => {
  try {
    // 创建集合
    await db.createCollection("sales");
    await db.collection("sales").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        region: "华东",
        city: "上海",
        sales: 11,
      },
    });
    await db.collection("sales").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        region: "华东",
        city: "南京",
        sales: 11,
      },
    });
    await db.collection("sales").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        region: "华南",
        city: "广州",
        sales: 22,
      },
    });
    await db.collection("sales").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        region: "华南",
        city: "深圳",
        sales: 22,
      },
    });
    return {
      success: true,
    };
  } catch (e) {
    // 这里catch到的是该collection已经存在，从业务逻辑上来说是运行成功的，所以catch返回success给前端，避免工具在前端抛出异常
    return {
      success: true,
      data: "create collection success",
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
      return await createCollection();
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
        if (!id) return { success: false, errMsg: "帖子ID缺失" };
        await db
          .collection("posts")
          .doc(id)
          .update({
            data: {
              likes: db.command.inc(1),
            },
          });
        return { success: true };
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
        return { success: true };
      } catch (e) {
        return { success: false, errMsg: e.message };
      }
  }
};
