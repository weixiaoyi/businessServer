class Response {
  success = (res, { data, code = 1, msg = "success", pagination } = {}) => {
    if (!res) console.error("res不存在");
    return res.json({
      ...(data ? { data } : {}),
      code,
      msg,
      ...(pagination
        ? {
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total
          }
        : {})
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
}

export default Response;
