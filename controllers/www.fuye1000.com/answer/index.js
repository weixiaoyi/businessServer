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
  };

  getAnswers = async (req, res) => {
    const { page, pageSize } = req.query;
    const counts = await Answer.countDocuments().catch(this.handleSqlError);
    const data = await Answer.find()
      .limit(Number(pageSize))
      .skip((page - 1) * pageSize)
      .catch(this.handleSqlError);
    if (!counts || !data) return this.fail(res);
    return this.success(res, {
      data: data.map(item => ({
        answerId: item.answerId,
        authorName: item.authorName,
        content: item.content,
        createTime: item.createTime,
        questionId: item.questionId,
        title: item.title
      })),
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: counts
      }
    });
  };

  uploadAnswer = async (req, res) => {
    const answer = req.body;
    const result = await Answer.findOneAndUpdate(
      { answerId: answer.answerId },
      {
        ...answer,
        createTime: Date.now()
      },
      { new: true, upsert: true }
    ).catch(this.handleSqlError);
    if (!result) return res.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new AnswerController().router;
