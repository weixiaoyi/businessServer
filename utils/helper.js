import _trimHtml from "trim-html";

export const splitQueryString = strings => {
  if (!strings) return {};
  const resultsObj = {};
  const result = strings.split("&");
  result.forEach(item => {
    const items = item.split("=");
    resultsObj[items[0]] = items[1];
  });
  return resultsObj;
};

export const trimHtml = (_html, options = {}) => {
  try {
    let { html, more } = _trimHtml(_html, options);
    html = html.replace(/&nbsp;/g, "");
    return {
      html,
      more
    };
  } catch (e) {
    console.error("trimHtml错误");
    return {
      html: ""
    };
  }
};

export const aggregate = {
  project: (string, options = {}) => {
    const keys = string.split(" ").filter(item => item);
    const obj = keys.reduce((sum, next) => {
      sum[next] = 1;
      return sum;
    }, {});
    return {
      ...obj,
      ...options
    };
  }
};
