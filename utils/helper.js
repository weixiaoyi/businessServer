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
