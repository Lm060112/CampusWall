const ROLE_TEXT = {
  admin: "管理员",
  merchant_staff: "运营人员",
  runner: "跑腿人员",
  student: "学生",
};

const ORDER_STATUS_OPTIONS_BY_SOURCE = {
  campus: [
    { status: "preparing", text: "制作中" },
    { status: "ready", text: "待取餐" },
    { status: "completed", text: "已完成" },
    { status: "refunded", text: "已退款" },
  ],
  takeaway: [
    { status: "preparing", text: "商家备餐中" },
    { status: "delivering", text: "配送中" },
    { status: "completed", text: "已完成" },
    { status: "refunded", text: "已退款" },
  ],
  errand: [
    { status: "waiting", text: "等待接单" },
    { status: "processing", text: "跑腿处理中" },
    { status: "completed", text: "已完成" },
    { status: "refunded", text: "已取消/退款" },
  ],
  nearby: [
    { status: "reserved", text: "预约成功" },
    { status: "active", text: "待参加" },
    { status: "completed", text: "已完成" },
    { status: "refunded", text: "已退款" },
  ],
};

const ROLE_OPTIONS = [
  { role: "student", text: "学生" },
  { role: "runner", text: "跑腿人员" },
  { role: "merchant_staff", text: "运营人员" },
  { role: "admin", text: "管理员" },
];

function callCampusApi(data) {
  return wx.cloud.callFunction({
    name: "campusApi",
    data,
  });
}

Page({
  data: {
    loading: false,
    role: "",
    roleText: "",
    tabs: [],
    activeTab: "orders",
    orders: [],
    merchants: [],
    products: [],
    announcements: [],
    users: [],
    reports: [],
    managePosts: [],
    verifications: [],
    adminLogs: [],
    dashboard: {},
    dashboardCards: [],
    searchKeyword: "",
    statusFilter: "all",
    roleFilter: "all",
    visibleOrders: [],
    visibleAnnouncements: [],
    visibleMerchants: [],
    visibleProducts: [],
    visibleUsers: [],
    visibleReports: [],
    visiblePosts: [],
    visibleVerifications: [],
    visibleAdminLogs: [],
    noticeForm: {
      id: "",
      title: "",
      type: "通知",
      content: "",
      date: "",
      sort: 10,
    },
    merchantForm: {
      id: "",
      name: "",
      sourceType: "campus",
      category: "校内服务",
      tag: "校内自营",
      address: "",
      eta: "",
      sort: 10,
    },
    productForm: {
      id: "",
      merchantId: "",
      name: "",
      category: "热销",
      price: "",
      stock: 99,
      sort: 10,
    },
    selectedMerchantName: "",
  },

  onLoad() {
    this.initRole();
  },

  onShow() {
    this.loadActiveData();
  },

  initRole() {
    const userInfo = wx.getStorageSync("userInfo") || {};
    const role = userInfo.role || "student";
    const tabs = this.getTabs(role);
    this.setData({
      role,
      roleText: ROLE_TEXT[role] || "未知角色",
      tabs,
      activeTab: tabs[0] ? tabs[0].key : "none",
    });
  },

  getTabs(role) {
    if (role === "admin") {
      return [
        { key: "overview", title: "总览" },
        { key: "orders", title: "订单" },
        { key: "content", title: "公告" },
        { key: "goods", title: "商品" },
        { key: "moderation", title: "审核" },
        { key: "verify", title: "认证" },
        { key: "users", title: "用户" },
        { key: "logs", title: "日志" },
      ];
    }
    if (role === "merchant_staff") {
      return [
        { key: "overview", title: "总览" },
        { key: "orders", title: "订单" },
        { key: "goods", title: "商品" },
      ];
    }
    if (role === "runner") {
      return [
        { key: "overview", title: "总览" },
        { key: "orders", title: "订单" },
      ];
    }
    return [];
  },

  async loadActiveData() {
    if (!this.data.tabs.length) return;
    const tab = this.data.activeTab;
    if (tab === "overview") {
      await this.loadDashboard();
    } else if (tab === "orders") {
      await this.loadOrders();
    } else if (tab === "content") {
      await this.loadAnnouncements();
    } else if (tab === "goods") {
      await Promise.all([this.loadMerchants(), this.loadProducts()]);
    } else if (tab === "users") {
      await this.loadUsers();
    } else if (tab === "moderation") {
      await Promise.all([this.loadReports(), this.loadManagePosts()]);
    } else if (tab === "verify") {
      await this.loadVerifications();
    } else if (tab === "logs") {
      await this.loadAdminLogs();
    }
  },

  async runTask(task, silent = false) {
    if (this.data.loading) return;
    this.setData({ loading: true });
    try {
      await task();
      if (!silent) wx.showToast({ title: "操作成功", icon: "success" });
    } catch (err) {
      wx.showToast({ title: err.message || "操作失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },

  async request(data) {
    try {
      const res = await callCampusApi(data);
      if (!res.result || !res.result.success) {
        throw new Error((res.result && res.result.errMsg) || "请求失败");
      }
      return res.result.data;
    } catch (err) {
      if (String(err.message || "").includes("permission denied")) {
        throw new Error("当前账号没有该操作权限");
      }
      if (String(err.message || "").includes("collection not exists")) {
        throw new Error("数据库集合缺失，请先创建集合");
      }
      throw err;
    }
  },

  async loadDashboard() {
    await this.runTask(async () => {
      const dashboard = await this.request({ action: "getAdminDashboard" });
      const cards = [
        { key: "pendingOrders", label: "待处理订单", value: dashboard.pendingOrders || 0, tab: "orders" },
        { key: "refundOrders", label: "售后订单", value: dashboard.refundOrders || 0, tab: "orders" },
        { key: "merchants", label: "商家/服务", value: dashboard.merchants || 0, tab: "goods" },
        { key: "products", label: "商品", value: dashboard.products || 0, tab: "goods" },
        { key: "pendingReports", label: "待处理举报", value: dashboard.pendingReports || 0, tab: "moderation" },
        { key: "pendingVerifications", label: "认证申请", value: dashboard.pendingVerifications || 0, tab: "verify" },
        { key: "users", label: "活跃用户", value: dashboard.users || 0, tab: "users" },
        { key: "adminLogs", label: "操作日志", value: dashboard.adminLogs || 0, tab: "logs" },
      ].filter((item) => this.data.tabs.some((tab) => tab.key === item.tab) || ["pendingOrders", "refundOrders"].includes(item.key));
      this.setData({ dashboard, dashboardCards: cards });
    }, true);
  },

  onDashboardCardTap(e) {
    const tab = e.currentTarget.dataset.tab;
    if (!this.data.tabs.some((item) => item.key === tab)) return;
    this.setData({ activeTab: tab }, () => this.loadActiveData());
  },

  onTabTap(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ activeTab: key, searchKeyword: "", statusFilter: "all", roleFilter: "all" }, () => this.loadActiveData());
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value || "" }, () => this.applyFilters());
  },

  onStatusFilterTap() {
    const options = [
      { label: "全部", value: "all" },
      { label: "待处理", value: "pending" },
      { label: "进行中", value: "processing" },
      { label: "已完成", value: "completed" },
      { label: "已退款", value: "refunded" },
    ];
    wx.showActionSheet({
      itemList: options.map((item) => item.label),
      success: (res) => {
        this.setData({ statusFilter: options[res.tapIndex].value }, () => this.applyFilters());
      },
    });
  },

  onRoleFilterTap() {
    const options = [{ role: "all", text: "全部角色" }].concat(ROLE_OPTIONS);
    wx.showActionSheet({
      itemList: options.map((item) => item.text),
      success: (res) => {
        this.setData({ roleFilter: options[res.tapIndex].role }, () => this.applyFilters());
      },
    });
  },

  matchKeyword(item, fields) {
    const keyword = String(this.data.searchKeyword || "").trim().toLowerCase();
    if (!keyword) return true;
    return fields.some((field) => String(item[field] || "").toLowerCase().includes(keyword));
  },

  matchStatus(item) {
    const filter = this.data.statusFilter;
    if (filter === "all") return true;
    if (filter === "pending") return ["pending", "pending_pay", "refund_pending", "waiting"].includes(item.status);
    if (filter === "processing") return ["preparing", "delivering", "processing", "ready", "active", "reserved"].includes(item.status);
    return item.status === filter;
  },

  applyFilters() {
    const roleFilter = this.data.roleFilter;
    this.setData({
      visibleOrders: this.data.orders.filter((item) => this.matchKeyword(item, ["merchantName", "itemText", "statusText", "orderNo"]) && this.matchStatus(item)),
      visibleAnnouncements: this.data.announcements.filter((item) => this.matchKeyword(item, ["id", "title", "content", "type"])),
      visibleMerchants: this.data.merchants.filter((item) => this.matchKeyword(item, ["id", "name", "category", "address", "tag"])),
      visibleProducts: this.data.products.filter((item) => this.matchKeyword(item, ["id", "name", "merchantName", "category"])),
      visibleUsers: this.data.users.filter((item) => (roleFilter === "all" || item.role === roleFilter) && this.matchKeyword(item, ["nickName", "campus", "roleText"])),
      visibleReports: this.data.reports.filter((item) => this.matchKeyword(item, ["targetType", "reason", "desc", "targetId"])),
      visiblePosts: this.data.managePosts.filter((item) => this.matchKeyword(item, ["topic", "tagText", "content", "authorName"]) && this.matchStatus(item)),
      visibleVerifications: this.data.verifications.filter((item) => this.matchKeyword(item, ["name", "campus", "studentNo", "desc"])),
      visibleAdminLogs: this.data.adminLogs.filter((item) => this.matchKeyword(item, ["operatorName", "role", "action", "targetType", "targetId"])),
    });
  },

  async loadOrders() {
    await this.runTask(async () => {
      const data = await this.request({ action: "listOrders", manage: true, pageSize: 100 });
      const orders = (data.list || []).map((item) => ({
        ...item,
        id: item._id || item.id,
        merchantName: item.merchant && item.merchant.name ? item.merchant.name : "订单",
        totalText: ((Number(item.totalAmount || 0)) / 100).toFixed(2),
        itemText: (item.items || []).map((goods) => `${goods.name}x${goods.count}`).join("、"),
      }));
      this.setData({ orders }, () => this.applyFilters());
    }, true);
  },

  async loadMerchants() {
    const merchants = await this.request({ action: "listMerchants", pageSize: 100 });
    this.setData({ merchants }, () => this.applyFilters());
  },

  async loadProducts() {
    const list = await this.request({ action: "listProducts", pageSize: 100 });
    const products = list.map((item) => ({
      ...item,
      merchantName: (this.data.merchants.find((merchant) => merchant.id === item.merchantId) || {}).name || item.merchantId,
      priceText: ((Number(item.price || 0)) / 100).toFixed(2),
    }));
    this.setData({ products }, () => this.applyFilters());
  },

  async loadAnnouncements() {
    await this.runTask(async () => {
      const announcements = await this.request({ action: "listAnnouncements", pageSize: 50 });
      this.setData({ announcements }, () => this.applyFilters());
    }, true);
  },

  async loadUsers() {
    await this.runTask(async () => {
      const users = await this.request({ action: "listUsers", pageSize: 100 });
      this.setData({
        users: users.map((item) => ({
          ...item,
          roleText: ROLE_TEXT[item.role] || item.role,
        })),
      }, () => this.applyFilters());
    }, true);
  },

  async loadReports() {
    const reports = await this.request({ action: "listReports", status: "pending", pageSize: 100 });
    this.setData({ reports }, () => this.applyFilters());
  },

  async loadManagePosts() {
    const data = await this.request({ action: "listManagePosts", pageSize: 100 });
    this.setData({ managePosts: data.list || [] }, () => this.applyFilters());
  },

  async loadVerifications() {
    const verifications = await this.request({ action: "listVerificationRequests", status: "pending", pageSize: 100 });
    this.setData({ verifications }, () => this.applyFilters());
  },

  async loadAdminLogs() {
    const logs = await this.request({ action: "listAdminLogs", pageSize: 100 });
    this.setData({ adminLogs: logs.map((item) => ({ ...item, timeText: this.formatTime(item.createdAt) })) }, () => this.applyFilters());
  },

  formatTime(ts) {
    const d = new Date(Number(ts || Date.now()));
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },

  onOrderStatusTap(e) {
    const orderId = e.currentTarget.dataset.id;
    const sourceType = e.currentTarget.dataset.sourceType || "campus";
    const statusOptions = this.getOrderStatusOptions(sourceType);
    wx.showActionSheet({
      itemList: statusOptions.map((item) => item.text),
      success: (res) => {
        const option = statusOptions[res.tapIndex];
        wx.showModal({
          title: "确认修改状态",
          content: `将订单改为“${option.text}”？`,
          success: (modal) => {
            if (!modal.confirm) return;
            this.runTask(async () => {
              await this.request({
                action: "updateOrderStatus",
                orderId,
                status: option.status,
                statusText: option.text,
              });
              await this.loadOrders();
            });
          },
        });
      },
    });
  },

  getOrderStatusOptions(sourceType) {
    return ORDER_STATUS_OPTIONS_BY_SOURCE[sourceType] || ORDER_STATUS_OPTIONS_BY_SOURCE.campus;
  },

  onModeratePostTap(e) {
    const postId = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ["恢复展示", "隐藏内容", "删除内容"],
      success: (res) => {
        const options = [
          { status: "published", text: "恢复展示" },
          { status: "hidden", text: "隐藏内容" },
          { status: "deleted", text: "删除内容" },
        ];
        const option = options[res.tapIndex];
        wx.showModal({
          title: "确认审核操作",
          content: `确定要${option.text}吗？`,
          success: (modal) => {
            if (!modal.confirm) return;
            this.runTask(async () => {
              await this.request({ action: "moderatePost", postId, status: option.status });
              await this.loadManagePosts();
            });
          },
        });
      },
    });
  },

  onResolveReportTap(e) {
    const reportId = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ["标记已处理", "驳回举报"],
      success: (res) => {
        const status = res.tapIndex === 0 ? "resolved" : "rejected";
        this.runTask(async () => {
          await this.request({ action: "resolveReport", reportId, status });
          await this.loadReports();
        });
      },
    });
  },

  onReviewVerificationTap(e) {
    const requestId = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ["通过认证", "拒绝认证"],
      success: (res) => {
        const status = res.tapIndex === 0 ? "approved" : "rejected";
        wx.showModal({
          title: "确认认证审核",
          content: status === "approved" ? "通过后用户会获得学生认证标识。" : "确定拒绝这条认证申请？",
          success: (modal) => {
            if (!modal.confirm) return;
            this.runTask(async () => {
              await this.request({ action: "reviewVerification", requestId, status });
              await this.loadVerifications();
            });
          },
        });
      },
    });
  },

  onRoleTap(e) {
    const userId = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ROLE_OPTIONS.map((item) => item.text),
      success: (res) => {
        const option = ROLE_OPTIONS[res.tapIndex];
        wx.showModal({
          title: "确认修改角色",
          content: `将该用户改为“${option.text}”？`,
          success: (modal) => {
            if (!modal.confirm) return;
            this.runTask(async () => {
              await this.request({
                action: "updateUserRole",
                userId,
                role: option.role,
              });
              await this.loadUsers();
            });
          },
        });
      },
    });
  },

  onClearNotice() {
    this.setData({
      noticeForm: { id: "", title: "", type: "通知", content: "", date: "", sort: 10 },
    });
  },

  onClearMerchant() {
    this.setData({
      merchantForm: { id: "", name: "", sourceType: "campus", category: "校内服务", tag: "校内自营", address: "", eta: "", sort: 10 },
    });
  },

  onClearProduct() {
    this.setData({
      productForm: { id: "", merchantId: "", name: "", category: "热销", price: "", stock: 99, sort: 10 },
      selectedMerchantName: "",
    });
  },
  onNoticeInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`noticeForm.${field}`]: e.detail.value });
  },

  onMerchantInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`merchantForm.${field}`]: e.detail.value });
  },

  onProductInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`productForm.${field}`]: e.detail.value });
  },

  onMerchantPickTap() {
    const merchants = this.data.merchants;
    if (!merchants.length) {
      wx.showToast({ title: "暂无商家可选", icon: "none" });
      return;
    }
    wx.showActionSheet({
      itemList: merchants.map((item) => item.name || item.id).slice(0, 6),
      success: (res) => {
        const merchant = merchants[res.tapIndex];
        this.setData({
          "productForm.merchantId": merchant.id,
          selectedMerchantName: merchant.name || merchant.id,
        });
      },
    });
  },

  fillMerchant(e) {
    const item = this.data.merchants.find((merchant) => merchant.id === e.currentTarget.dataset.id);
    if (!item) return;
    this.setData({
      merchantForm: {
        id: item.id || "",
        name: item.name || "",
        sourceType: item.sourceType || "campus",
        category: item.category || "",
        tag: item.tag || "",
        address: item.address || "",
        eta: item.eta || "",
        sort: item.sort || 10,
      },
    });
  },

  fillProduct(e) {
    const item = this.data.products.find((product) => product.id === e.currentTarget.dataset.id);
    if (!item) return;
    this.setData({
      productForm: {
        id: item.id || "",
        merchantId: item.merchantId || "",
        name: item.name || "",
        category: item.category || "热销",
        price: item.price ? String(Number(item.price) / 100) : "",
        stock: item.stock || 99,
        sort: item.sort || 10,
      },
      selectedMerchantName: (this.data.merchants.find((merchant) => merchant.id === item.merchantId) || {}).name || item.merchantId || "",
    });
  },

  fillAnnouncement(e) {
    const item = this.data.announcements.find((notice) => notice.id === e.currentTarget.dataset.id);
    if (!item) return;
    this.setData({
      noticeForm: {
        id: item.id || "",
        title: item.title || "",
        type: item.type || "通知",
        content: item.content || "",
        date: item.date || "",
        sort: item.sort || 10,
      },
    });
  },

  onSaveAnnouncement() {
    const form = this.data.noticeForm;
    if (!form.id || !form.title) {
      wx.showToast({ title: "请填写公告ID和标题", icon: "none" });
      return;
    }
    this.runTask(async () => {
      await this.request({ action: "saveAnnouncement", announcement: form });
      await this.loadAnnouncements();
    });
  },

  onSaveMerchant() {
    const form = this.data.merchantForm;
    if (!form.id || !form.name) {
      wx.showToast({ title: "请填写商家ID和名称", icon: "none" });
      return;
    }
    this.runTask(async () => {
      await this.request({ action: "saveMerchant", merchant: form });
      await this.loadMerchants();
    });
  },

  onSaveProduct() {
    const form = this.data.productForm;
    if (!form.id || !form.merchantId || !form.name) {
      wx.showToast({ title: "请填写商品ID、商家ID和名称", icon: "none" });
      return;
    }
    this.runTask(async () => {
      await this.request({
        action: "saveProduct",
        product: {
          ...form,
          price: Math.round(Number(form.price || 0) * 100),
        },
      });
      await this.loadProducts();
    });
  },
});
