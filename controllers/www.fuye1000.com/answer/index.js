import _ from "lodash";
import { Router, Authority, Db, Validator, Env } from "../../../components";
import { Answer, AnswerDb, Member } from "../../../models";
import { trimHtml } from "../../../utils";

class AnswerController extends Router {
  constructor(props) {
    super(props);
    this.init();
    this.answerView =
      "answerId authorName content createTime currentUpVoteNum title online";
  }

  init = () => {
    this.authority = new Authority();
    this.db = new Db();
    this.validator = new Validator();
    this.env = new Env();
    this.router.get("/getAnswers", this.getAnswers);
    this.router.post(
      "/uploadAnswer",
      [this.authority.checkAdmin],
      this.uploadAnswer
    );
    this.router.put(
      "/onlineAnswer",
      [this.authority.checkAdmin],
      this.onlineAnswer
    );
    this.router.put(
      "/offlineAnswer",
      [this.authority.checkAdmin],
      this.offlineAnswer
    );
    this.router.delete(
      "/deleteLineAnswer",
      [this.authority.checkAdmin],
      this.deleteLineAnswer
    );
    this.router.put(
      "/updateLineAnswer",
      [this.authority.checkAdmin],
      this.updateLineAnswer
    );
    this.router.post("/voteAnswer", this.voteAnswer);
    this.router.post(
      "/checkLineAnswer",
      [this.authority.checkAdmin],
      this.checkLineAnswer
    );
  };

  getAnswers = async (req, res) => {
    let hasMemberAuthority = false;
    const { page, pageSize, dbName, online } = req.query;
    const isValid = this.validator.validate(req.query, [
      {
        field: "page",
        type: "isInt"
      },
      {
        field: "pageSize",
        type: "isInt",
        payload: this.env.isCustomer(req)
          ? {
              min: 1,
              max: 1
            }
          : undefined
      },
      {
        field: "dbName",
        type: "required"
      },
      {
        field: "online",
        type: this.env.isCustomer(req) ? "equals" : undefined,
        payload: "on"
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });

    const dbInfo = await AnswerDb.findOne({
      name: dbName,
      ...(online ? { online } : {})
    }).catch(this.handleError);
    if (this.isError(dbInfo) || this.isNull(dbInfo))
      return this.fail(res, { msg: "线上未找到对应的dbName,检查是否上线" });

    const dbInfoLimit = _.get(dbInfo, "member.limit");
    if (dbInfoLimit && page <= dbInfoLimit) {
      hasMemberAuthority = true;
    } else if (req.session.user) {
      const { _id } = req.session.user;
      const memberInfo = await Member.findOne({
        accountId: _id
      }).catch(this.handleError);
      if (this.isError(memberInfo)) return this.fail(res);
      hasMemberAuthority =
        _.get(memberInfo, `detail.all.status`) ||
        _.get(memberInfo, `detail.${dbName.replace(".json", "")}.status`);
    }

    const result = await this.db
      .handlePage({
        Model: Answer,
        pagination: { page, pageSize },
        match: {
          dbName,
          ...(online ? { online } : {})
        },
        project: this.answerView
      })
      .catch(this.handleError);

    if (this.isError(result) || this.isNull(result)) return this.fail(res);

    return this.success(res, {
      data: result.data.map(item => ({
        ...item,
        content: hasMemberAuthority
          ? item.content
          : trimHtml(item.content, {
              limit: 30,
              wordBreak: true
            }).html
      })),
      pagination: {
        page,
        pageSize,
        total: result.total
      },
      requiredInfo: {
        hasMemberAuthority
      }
    });
  };

  deleteLineAnswer = async (req, res) => {
    const { answerId } = req.body;
    if (!answerId) return this.fail(res);
    const result = await Answer.findOneAndRemove(
      { answerId },
      { new: true }
    ).catch(this.handleError);
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  offlineAnswer = async (req, res) => {
    const { answerId } = req.body;
    if (!answerId) return this.fail(res);
    const result = await Answer.findOneAndUpdate(
      { answerId },
      {
        online: "off"
      },
      { new: true }
    ).catch(this.handleError);
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  onlineAnswer = async (req, res) => {
    const { answerId } = req.body;
    if (!answerId) return this.fail(res);
    const result = await Answer.findOneAndUpdate(
      { answerId },
      {
        online: "on"
      },
      { new: true }
    ).catch(this.handleError);
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  uploadAnswer = async (req, res) => {
    const {
      answerId,
      authorName,
      content,
      dbName,
      prevUpVoteNum,
      questionId,
      title
    } = req.body;
    if (!answerId || !authorName || !content || !dbName)
      return this.fail(res, {
        status: 400
      });
    const newAnswer = new Answer({
      answerId,
      authorName,
      content,
      dbName,
      prevUpVoteNum,
      questionId,
      title,
      createTime: Date.now()
    });
    const result = await newAnswer.save().catch(this.handleError);
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  updateLineAnswer = async (req, res) => {
    const { answerId, content } = req.body;
    if (!answerId || !content)
      return this.fail(res, {
        status: 400
      });
    const result = await Answer.findOneAndUpdate(
      { answerId },
      {
        content,
        updateTime: Date.now()
      },
      { new: true }
    ).catch(this.handleError);
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  voteAnswer = async (req, res) => {
    const { answerId } = req.body;
    if (!answerId)
      return this.fail(res, {
        status: 400
      });
    const result = await Answer.findOneAndUpdate(
      { answerId },
      {
        $inc: { currentUpVoteNum: 1 }
      },
      { new: true }
    ).catch(this.handleError);
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  checkLineAnswer = async (req, res) => {
    const { answerId } = req.body;
    if (!answerId)
      return this.fail(res, {
        status: 400
      });

    // 故意用find,而不是 findOne,避免找不到和catch冲突
    const result = await Answer.find({ answerId }).catch(this.handleError);
    if (this.isError(result) || this.isNull(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new AnswerController().router;
