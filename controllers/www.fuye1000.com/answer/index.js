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
    const { page, pageSize, dbName, online } = req.query;
    if (!page || !pageSize || !dbName)
      return this.fail(res, {
        status: 400
      });

    const limits = { dbName, ...(online ? { online } : {}) };
    const answerConstructor = Answer.find(limits).toConstructor();
    const total = await answerConstructor()
      .countDocuments()
      .catch(this.handleSqlError);
    if (total === null) return this.fail(res);
    const data = await answerConstructor()
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
        currentUpVoteNum: item.currentUpVoteNum,
        title: item.title,
        dbName: item.dbName,
        online: item.online
      })),
      pagination: {
        page,
        pageSize,
        total
      }
    });
  };

  deleteLineAnswer = async (req, res) => {
    const { answerId } = req.body;
    if (!answerId) return this.fail(res);
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
    if (!answerId) return this.fail(res);
    const result = await Answer.findOneAndUpdate(
      { answerId },
      {
        online: "off"
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
    if (!answerId) return this.fail(res);
    const result = await Answer.findOneAndUpdate(
      { answerId },
      {
        online: "on"
      },
      { new: true }
    ).catch(this.handleSqlError);
    if (!result) return this.fail(res);
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
    const result = await newAnswer.save().catch(this.handleSqlError);
    if (!result) return this.fail(res);
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
    ).catch(this.handleSqlError);
    if (!result) return this.fail(res);
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
    ).catch(this.handleSqlError);
    if (!result) return this.fail(res);
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
    const result = await Answer.find({ answerId }).catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new AnswerController().router;
