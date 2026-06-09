const SERVICE_AREAS = {
  chongming_chenjia: {
    id: "chongming_chenjia",
    name: "上海市崇明区陈家镇大学城及周边",
  },
};

const INSTITUTIONS = {
  zhonghua: {
    id: "zhonghua",
    name: "中华职业技术学院",
    shortName: "中华",
    aliases: [],
  },
  xdsisu: {
    id: "xdsisu",
    name: "上海外国语大学贤达经济人文学院",
    shortName: "贤达",
    aliases: ["上外贤达", "贤达学院"],
  },
  shmy: {
    id: "shmy",
    name: "上海民远职业技术学院",
    shortName: "民远",
    aliases: ["民远学院", "民远"],
  },
  sjtu: {
    id: "sjtu",
    name: "上海交通大学",
    shortName: "交大",
    aliases: ["上海交大", "交大"],
  },
};

const CAMPUSES = {
  zhonghua_chongming: {
    id: "zhonghua_chongming",
    institutionId: "zhonghua",
    serviceAreaId: "chongming_chenjia",
    displayName: "中华",
    officialName: "中华职业技术学院",
    operationStatus: "active",
    marketRole: "order_pilot",
    enabledModules: ["campus_order", "errand", "takeaway_light_order", "needs", "content"],
  },
  xdsisu_chongming: {
    id: "xdsisu_chongming",
    institutionId: "xdsisu",
    serviceAreaId: "chongming_chenjia",
    displayName: "贤达",
    officialName: "上海外国语大学贤达经济人文学院",
    operationStatus: "active",
    marketRole: "mature_market_integration",
    enabledModules: ["needs", "content", "merchant_ads", "jobs_info", "takeaway_light_order"],
  },
  shmy_chongming: {
    id: "shmy_chongming",
    institutionId: "shmy",
    serviceAreaId: "chongming_chenjia",
    displayName: "民远",
    officialName: "上海民远职业技术学院",
    operationStatus: "pre_operation",
    marketRole: "freshman_entry",
    enabledModules: ["needs", "content", "freshman_life_pack", "campus_partner_apply", "jobs_info"],
  },
  sjtu_chongming: {
    id: "sjtu_chongming",
    institutionId: "sjtu",
    serviceAreaId: "chongming_chenjia",
    displayName: "交大",
    officialName: "上海交通大学",
    operationStatus: "reserved",
    marketRole: "future_reserved",
    enabledModules: [],
  },
};

const DEFAULT_CAMPUS_ID = "zhonghua_chongming";

function getServiceAreaById(serviceAreaId) {
  return SERVICE_AREAS[serviceAreaId] || null;
}

function getInstitutionById(institutionId) {
  return INSTITUTIONS[institutionId] || null;
}

function getCampusById(campusId) {
  return CAMPUSES[campusId] || null;
}

function getDefaultCampus() {
  return getCampusById(DEFAULT_CAMPUS_ID);
}

// 前端校区选择器使用的轻量数据。
function getCampusOptions() {
  return Object.keys(CAMPUSES).map((id) => {
    const campus = CAMPUSES[id];
    return {
      id,
      displayName: campus.displayName,
      officialName: campus.officialName,
      operationStatus: campus.operationStatus,
    };
  });
}

function isModuleEnabled(campusId, moduleKey) {
  const campus = getCampusById(campusId);
  if (!campus) return false;
  return campus.enabledModules.includes(moduleKey);
}

function getCampusesByServiceArea(serviceAreaId) {
  return Object.keys(CAMPUSES)
    .map((id) => CAMPUSES[id])
    .filter((campus) => campus.serviceAreaId === serviceAreaId);
}

function getCampusesByInstitution(institutionId) {
  return Object.keys(CAMPUSES)
    .map((id) => CAMPUSES[id])
    .filter((campus) => campus.institutionId === institutionId);
}

module.exports = {
  SERVICE_AREAS,
  INSTITUTIONS,
  CAMPUSES,
  DEFAULT_CAMPUS_ID,
  getServiceAreaById,
  getInstitutionById,
  getCampusById,
  getDefaultCampus,
  getCampusOptions,
  isModuleEnabled,
  getCampusesByServiceArea,
  getCampusesByInstitution,
};
