import { Router, Authority } from "../../../components";
import { Answer } from "../../../models";

class AnswerController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.authority = new Authority();
    this.router.get("/getAnswers", this.getAnswers);
    this.router.post("/uploadAnswer", this.uploadAnswer);
    this.router.post("/onlineAnswer", this.onlineAnswer);
    this.router.post("/offlineAnswer", this.offlineAnswer);
    this.router.post("/deleteLineAnswer", this.deleteLineAnswer);
    this.router.post("/updateLineAnswer", this.updateLineAnswer);
    this.router.post("/checkLineAnswer", this.checkLineAnswer);
  };

  getAnswers = async (req, res) => {
    const { page, pageSize } = req.query;
    const counts = await Answer.countDocuments().catch(this.handleSqlError);
    const data = await Answer.find()
      .limit(Number(pageSize))
      .skip((page - 1) * pageSize)
      .catch(this.handleSqlError);
    if (!data) return this.fail(res);
    return this.success(res, {
      data: data.map(item => ({
        answerId: item.answerId,
        authorName: item.authorName,
        content: item.content,
        createTime: item.createTime,
        questionId: item.questionId,
        prevUpVoteNum: item.prevUpVoteNum,
        title: item.title,
        dbName: item.dbName,
        online: item.online
      })),
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: counts
      }
    });
  };

  deleteLineAnswer = async (req, res) => {
    const { answerId } = req.body;
    const result = await Answer.findOneAndRemove(
      { answerId },
      { new: true }
    ).catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  offlineAnswer = async (req, res) => {
    const { answerId } = req.body;
    const result = await Answer.findOneAndUpdate(
      { answerId },
      {
        $set: { online: "off" }
      },
      { new: true }
    ).catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  onlineAnswer = async (req, res) => {
    const { answerId } = req.body;
    const result = await Answer.findOneAndUpdate(
      { answerId },
      {
        $set: { online: "on" }
      },
      { new: true }
    ).catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  uploadAnswer = async (req, res) => {
    const answer = req.body;
    if (!answer.dbName || !answer.content)
      return this.fail(res, {
        status: 401
      });
    const result = await Answer.findOneAndUpdate(
      { answerId: answer.answerId },
      {
        ...answer,
        createTime: Date.now()
      },
      { new: true, upsert: true }
    ).catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  updateLineAnswer = async (req, res) => {
    const { answerId, ...rest } = req.body;
    const result = await Answer.findOneAndUpdate(
      { answerId },
      {
        content: rest.content,
        updateTime: Date.now()
      },
      { new: true }
    ).catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  checkLineAnswer = async (req, res) => {
    const { answerId } = req.body;
    const result = await Answer.find({ answerId }).catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new AnswerController().router;
