import _ from "lodash";
import { aggregate } from "../utils";

class Response {
  success = (res, { data, code = 1, msg = "success", pagination } = {}) => {
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

  handlePage = async ({ Model, filters, pagination, project }) => {
    if (!Model || !pagination) return console.error("handlePage参数错误");
    const res = await Model.aggregate(
      [].concat(
        filters
          ? [
              {
                $match: filters
              }
            ]
          : []
      )
    )
      .facet({
        total: [
          {
            $count: "total"
          }
        ],
        data: []
          .concat([
            {
              $skip: (pagination.page - 1) * pagination.pageSize
            }
          ])
          .concat([
            {
              $limit: Number(pagination.pageSize)
            }
          ])
          .concat(
            project
              ? [
                  {
                    $project: _.isString(project)
                      ? aggregate.project(project)
                      : project
                  }
                ]
              : []
          )
      })
      .catch(this.handleSqlError);
    const [total, data] = [_.get(res, "0.total.0.total"), _.get(res, "0.data")];
    if (!data) return Promise.reject("分页错误");
    return {
      total,
      data
    };
  };
}

export default Response;
