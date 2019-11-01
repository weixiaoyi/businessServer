import _ from "lodash";
import mongoose from "mongoose";
import Response from "./Response";
import { aggregate } from "../utils";

class Db extends Response {
  // 分页聚合
  handlePage = async ({
    Model,
    match,
    pagination,
    project,
    lookup,
    map,
    sort,
    group,
    matchAfterLookup
  }) => {
    if (!Model || !pagination) return console.error("handlePage参数错误");
    const res = await Model.aggregate(
      [].concat(
        match
          ? [
              {
                $match: match
              }
            ]
          : []
      )
    )
      .facet({
        total: []
          .concat(
            matchAfterLookup
              ? (lookup
                  ? _.isArray(lookup)
                    ? lookup.map(item => ({ $lookup: item }))
                    : [
                        {
                          $lookup: lookup
                        }
                      ]
                  : []
                ).concat([
                  {
                    $match: matchAfterLookup
                  }
                ])
              : []
          )
          .concat([
            {
              $count: "total"
            }
          ]),
        data: []
          .concat(
            sort //分页的排序必须最先执行
              ? [
                  {
                    $sort: sort
                  }
                ]
              : []
          )
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
            lookup
              ? _.isArray(lookup)
                ? lookup.map(item => ({ $lookup: item }))
                : [
                    {
                      $lookup: lookup
                    }
                  ]
              : []
          )
          .concat(
            matchAfterLookup
              ? [
                  {
                    $match: matchAfterLookup
                  }
                ]
              : []
          )
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
      .catch(this.handleError);
    if (this.isError(res)) return Promise.reject(res);
    const [total, data] = [_.get(res, "0.total.0.total"), _.get(res, "0.data")];
    if (!data) return Promise.reject(res);
    return {
      total,
      data: map ? data.map(map) : data
    };
  };

  // 普通聚合，比较适合查询单一数据，非分页数据
  handleAggregate = async ({ Model, match, project, lookup, map, sort }) => {
    if (!Model) return console.error("handleAggregate参数错误");
    const res = await Model.aggregate(
      []
        .concat(
          match
            ? [
                {
                  $match: match
                }
              ]
            : []
        )
        .concat(
          lookup
            ? _.isArray(lookup)
              ? lookup.map(item => ({ $lookup: item }))
              : [
                  {
                    $lookup: lookup
                  }
                ]
            : []
        )
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
        .concat(
          sort // 普通连表查询最后执行排序
            ? [
                {
                  $sort: sort
                }
              ]
            : []
        )
    ).catch(this.handleError);
    if (this.isError(res)) return Promise.reject(res);
    return map ? res.map(map) : res;
  };

  ObjectId = id => mongoose.Types.ObjectId(id);
}

export default Db;

// IdeaComment.aggregate([
//   {
//     $match: { answerId, ...(online ? { online } : {}) }
//   }
// ])
//   .facet({
//     total: [
//       {
//         $count: "total"
//       }
//     ],
//     data: [
//       { $skip: (page - 1) * pageSize },
//       { $limit: Number(pageSize) },
//       {
//         $lookup: {
//           from: "user",
//           localField: "accountId",
//           foreignField: "_id",
//           as: "popUser"
//         }
//       }
//     ]
//   })
//   .then(res => {
//     //console.log(res[0].data[0].look);
//   });
