import { Router, Authority } from "../../../components";
import { Idea } from "../../../models";

class IdeaController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.authority = new Authority();
    this.router.get("/getIdeas", this.getIdeas);
    this.router.post(
      "/publishIdea",
      [this.authority.checkLogin],
      this.publishIdea
    );
  };

  getIdeas = async (req, res) => {
    const { page, pageSize, online } = req.query;
    if (!page || !pageSize)
      return this.fail(res, {
        status: 400
      });
    const limits = { ...(online ? { online } : {}) };
    const ideaConstructor = Idea.find(limits).toConstructor();
    const total = await ideaConstructor()
      .countDocuments()
      .catch(this.handleSqlError);
    if (total === null) return this.fail(res);
    const data = await ideaConstructor()
      .populate({
        path: "popUser",
        select: "name"
      })
      .sort({ createTime: -1 })
      .limit(Number(pageSize))
      .skip((page - 1) * pageSize)
      .catch(this.handleSqlError);
    if (!data) return this.fail(res);
    return this.success(res, {
      data: data,
      pagination: {
        page,
        pageSize,
        total
      }
    });
  };

  publishIdea = async (req, res) => {
    const { title, brief, content } = req.body;
    if (!title || !brief || !content)
      return this.fail(res, {
        status: 400
      });
    const { _id } = req.session.user;
    const newIdea = new Idea({
      title,
      brief,
      content,
      accountId: _id,
      createTime: Date.now(),
      online: "on",
      popUser: _id
    });
    const result = await newIdea.save().catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new IdeaController().router;
