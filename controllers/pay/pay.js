const crypto = require("crypto");

const key = "ma4zsD5ziRnoPvbS";

function toQueryString(obj) {
  return Object.keys(obj)
    .filter(function(key) {
      return key !== "sign" && obj[key] !== undefined && obj[key] !== "";
    })
    .sort()
    .map(function(key) {
      if (/^http(s)?:\/\//.test(obj[key])) {
        return key + "=" + encodeURI(obj[key]);
      } else {
        return key + "=" + obj[key];
      }
    })
    .join("&");
}

function md5(str) {
  const encoding = arguments[1] !== void 0 ? arguments[1] : "utf8";
  return crypto
    .createHash("md5")
    .update(str, encoding)
    .digest("hex");
}

export const signature = paramss => {
  const params = paramss;
  let strparams = toQueryString(params); //签名第一步
  strparams += "&key=" + key; //签名第二步1
  const sign = md5(strparams).toUpperCase(); //签名第二步2
  params["sign"] = sign;
  return params;
};
