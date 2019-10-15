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
        msg: `${type}Error`,
        error
      };
    } else {
      console.log("未知操作错误", error);
      return {
        msg: "unknownError",
        error
      };
    }
  };

  isError = (handleErrorResult, type = "sql") => {
    if (!handleErrorResult)
      return console.error("isError缺少必要参数@handleErrorResult");
    if (!handleErrorResult.msg || !handleErrorResult.error)
      return console.error(
        "isError的handleErrorResult参数必须是handleError的处理结果"
      );
    if (type) {
      return type && handleErrorResult.msg === `${type}Error`;
    } else {
      return handleErrorResult.msg;
    }
  };
}

export default Response;
