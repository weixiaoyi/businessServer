import { Router, Authority } from "../../../components";
import { Idea } from "../../../models";
import { trimHtml } from "../../../utils";

class IdeaController extends Router {
  constructor(props) {
    super(props);
    this.init();
    this.ideaView = "accountId title content createTime";
  }

  init = () => {
    this.authority = new Authority();
    this.router.get("/getIdeasPreview", this.getIdeasPreview);
    this.router.get("/getIdeaDetail", this.getIdeaDetail);
    this.router.post(
      "/publishIdea",
      [this.authority.checkLogin],
      this.publishIdea
    );
    this.router.put("/editIdea", [this.authority.checkLogin], this.editIdea);
  };

  getIdeasPreview = async (req, res) => {
    const { page, pageSize, online } = req.query;
    if (!page || !pageSize)
      return this.fail(res, {
        status: 400
      });
    const limits = { ...(online ? { online } : {}) };
    const ideaConstructor = Idea.find(limits, this.ideaView).toConstructor();
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
      data: data.map(item => ({
        _id: item._id,
        accountId: item.accountId,
        title: item.title,
        brief: trimHtml(item.content, {
          limit: 30,
          preserveTags: false,
          wordBreak: true
        }).html
      })),
      pagination: {
        page,
        pageSize,
        total
      }
    });
  };

  getIdeaDetail = async (req, res) => {
    const { id } = req.query;
    if (!id)
      return this.fail(res, {
        status: 400
      });
    const data = await Idea.findById(id, this.ideaView)
      .populate({
        path: "popUser",
        select: "name"
      })
      .catch(this.handleSqlError);
    if (!data) return this.fail(res);
    return this.success(res, {
      data: {
        accountId: data.accountId,
        title: data.title,
        content: data.content,
        createTime: data.createTime,
        name: data.popUser.name
      }
    });
  };

  publishIdea = async (req, res) => {
    const { title, content } = req.body;
    if (!this.checkRequiredParams(title, content))
      return this.fail(res, {
        status: 400
      });
    const { _id } = req.session.user;
    const newIdea = new Idea({
      title,
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

  editIdea = async (req, res) => {
    const { id, title, content } = req.body;
    if (!id || !this.checkRequiredParams(title, content))
      return this.fail(res, {
        status: 400
      });
    const result = await Idea.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    ).catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  checkRequiredParams = (title, content) => {
    const html = trimHtml(content, { limit: 5000, preserveTags: false }).html;
    return (
      title &&
      content &&
      title.length >= 5 &&
      title.length <= 20 &&
      html.length >= 20 &&
      html.length <= 1500
    );
  };
}

export default new IdeaController().router;
