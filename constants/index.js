export const OAUTH = {
  github: {
    client_id: "10ba2762cbfe233a3880",
    client_secret: "89382938de32603f384cd52e9f2e58b0e28d2754"
  }
};

export const Domain = {
  fuye: {
    value: "fuye",
    prefix: "fuye-"
  }
};

export const ModelNames = {
  user: "user",
  userBlackList: "userBlackList",
  member: "member",
  websiteConfig: "websiteConfig",
  analysis: "analysis",
  sensitiveWord: "sensitiveWord",
  //-------------fuye1000.com

  fuye: {
    answer: `${Domain.fuye.prefix}answer`,
    answerComment: `${Domain.fuye.prefix}answerComment`,
    answerDb: `${Domain.fuye.prefix}answerDb`,
    idea: `${Domain.fuye.prefix}idea`,
    ideaComment: `${Domain.fuye.prefix}ideaComment`,
    ideaInterest: `${Domain.fuye.prefix}ideaInterest`
  }
};

export const Messages = {
  accountForbidden: "您的账号存在异常，如有疑问请联系本站",
  sensitiveWord: "数据内容包含敏感信息，请遵守互联网文明合法用语规范重新输入！"
};

export const CacheKeys = {
  sensitiveWord: "sensitiveWord",
  fuye: {
    answerDb: "answerDb"
  }
};

export const SetReqSession = (req, key, value) => {
  if (key === "user") {
    req.session.user = value;
  } else if (key === "captcha") {
    req.session.captcha = value;
  }
};

export const SetReq = (req, key, value) => {
  if (key === "decrypt") {
    req.decrypt = value;
  } else if (key === "blIsNormal") {
    req.blIsNormal = value;
  }
};
