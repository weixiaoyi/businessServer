import { Router, Authority } from "../../../components";
import { AnswerDb } from "../../../models";

class AnswerDbController extends Router {
  constructor(props) {
    super(props);
    this.init();
    this.answerDbView = "createTime intro member name title";
  }

  init = () => {
    this.authority = new Authority();
    this.router.get("/getAnswerDbs", this.getAnswerDbs);
    this.router.post(
      "/onlineAnswerDb",
      [this.authority.checkAdmin],
      this.onlineAnswerDb
    );
    this.router.put(
      "/offlineAnswerDb",
      [this.authority.checkAdmin],
      this.offlineAnswerDb
    );
    this.router.delete(
      "/deleteLineDb",
      [this.authority.checkAdmin],
      this.deleteLineDb
    );
    this.router.put(
      "/updateLineDb",
      [this.authority.checkAdmin],
      this.updateLineDb
    );
  };

  getAnswerDbs = async (req, res) => {
    const { page, pageSize, online } = req.query;
    if (!page || !pageSize) return this.fail(res, { status: 400 });
    const total = await AnswerDb.countDocuments().catch(this.handleSqlError);
    if (total === null) return this.fail(res);
    const data = await AnswerDb.find(
      online ? { online } : {},
      this.answerDbView
    )
      .limit(Number(pageSize))
      .skip((page - 1) * pageSize)
      .catch(this.handleSqlError);
    if (!data) return this.fail(res);
    return this.success(res, {
      data,
      pagination: {
        page,
        pageSize,
        total
      }
    });
  };

  onlineAnswerDb = async (req, res) => {
    const { name, title, intro, member } = req.body;
    if (!name || !title || !intro || !member)
      return this.fail(res, {
        status: 400
      });
    const result = await AnswerDb.findOneAndUpdate(
      { name },
      {
        name,
        title,
        intro,
        member,
        createTime: Date.now(),
        online: "on"
      },
      { new: true, upsert: true }
    ).catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  offlineAnswerDb = async (req, res) => {
    const { name } = req.body;
    if (!name)
      return this.fail(res, {
        status: 400
      });
    const result = await AnswerDb.findOneAndUpdate(
      { name },
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

  deleteLineDb = async (req, res) => {
    const { name } = req.body;
    if (!name)
      return this.fail(res, {
        status: 400
      });
    const result = await AnswerDb.findOneAndRemove(
      { name },
      { new: true }
    ).catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  updateLineDb = async (req, res) => {
    const { name, title, intro, member } = req.body;
    if (!name || !title || !intro || !member)
      return this.fail(res, {
        status: 400
      });
    const result = await AnswerDb.findOneAndUpdate(
      { name },
      {
        name,
        title,
        intro,
        member
      },
      { new: true }
    ).catch(this.handleSqlError);
    if (!result) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };
}

export default new AnswerDbController().router;
