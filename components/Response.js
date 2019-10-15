import _ from "lodash";
class Response {
  success = (
    res,
    { data, code = 1, msg = "success", pagination, requiredInfo } = {}
  ) => {
    if (!res) console.error("res不存在");
    return res.json({
      ...(data ? { data } : {}),
      code,
      msg,
      ...(pagination
        ? {
            current: Number(pagination.page),
            pageSize: Number(pagination.pageSize),
            total: Number(pagination.total)
          }
        : {}),
      ...(requiredInfo ? { requiredInfo } : {})
    });
  };

  fail = (res, { status = 500, data, code = -1, msg = "fail" } = {}) => {
    if (!res) console.error("res不存在");
    status ? res.status(status) : null;
    res.json({
      ...(data ? { data } : {}),
      code,
      msg
    });
    return null;
  };

  handleSqlError = error => {
    console.log("数据库操作错误", error);
    return null;
  };

  handleError = (error, type = "sql") => {
    if (!error || !type)
      return console.error("handleError缺少必要参数@error，@type");
    if (type === "sql") {
      console.log("数据库操作错误", error);
      return {
        errMsg: `${type}Error`,
        error
      };
    } else {
      console.log("未知操作错误", error);
      return {
        errMsg: "unknownError",
        error
      };
    }
  };

  isError = handleErrorResult => {
    if (!handleErrorResult) return false;
    return handleErrorResult.errMsg;
  };

  isNull = result => _.isNull(result);
}

export default Response;
