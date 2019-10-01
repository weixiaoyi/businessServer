import _ from "lodash";
import mongoose from "mongoose";
import { aggregate } from "../utils";

class Db {
  handlePage = async ({
    Model,
    match,
    pagination,
    project,
    lookup,
    map,
    sort
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
            sort
              ? [
                  {
                    $sort: sort
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
      .catch(this.handleSqlError);
    const [total, data] = [_.get(res, "0.total.0.total"), _.get(res, "0.data")];
    if (!data) return Promise.reject("分页错误");
    return {
      total,
      data: map ? data.map(map) : data
    };
  };

  handleAggregate = async ({ Model, match, project, lookup, map, sort }) => {
    if (!Model) return console.error("handleAggregate参数错误");
    const data = await Model.aggregate(
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
            ? [
                {
                  $lookup: lookup
                }
              ]
            : []
        )
        .concat(
          sort
            ? [
                {
                  $sort: sort
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
    ).catch(this.handleSqlError);
    if (!data) return Promise.reject("handleAggregate聚合查询错误");
    return map ? data.map(map) : data;
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
