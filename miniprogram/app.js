// app.js
App({
  onLaunch: function () {
    this.globalData = {
      // env 参数说明：
      // env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会请求到哪个云环境的资源
      // 此处请填入环境 ID, 环境 ID 可在微信开发者工具右上顶部工具栏点击云开发按钮打开获取
      env: "cloud1-d3gh3r7nm520f7c2b",
      userInfo: null,
    };
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });

      // 架构师一键修复脚本：自动检测并创建 comments 集合
      const db = wx.cloud.database();
      db.collection("comments")
        .get()
        .catch((err) => {
          if (err.errMsg.includes("collection not exists")) {
            console.log("【自动修复】检测到 comments 集合不存在，正在尝试创建...");
            wx.cloud.callFunction({
              name: "quickstartFunctions",
              data: { type: "createCollection", collection: "comments" },
            }).then((res) => {
              console.log("【自动修复】集合创建结果:", res);
              console.log("【自动修复】请再次点击'重新编译'以刷新状态");
            });
          }
        });
    }
  },
});
