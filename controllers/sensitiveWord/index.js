import { SensitiveWord } from "../../models";
import { Router, Authority, Validator, Db } from "../../components";
import { Cache } from "../../componentsSingle";
import { CacheKeys } from "../../constants";

class SensitiveWordController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.authority = new Authority();
    this.validator = new Validator();
    this.db = new Db();
    this.router.get("/getSensitiveWord", this.getSensitiveWord);
    this.router.post(
      "/addSensitiveWord",
      [this.authority.checkAdmin],
      this.addSensitiveWord
    );
    this.router.put(
      "/updateSensitiveWord",
      [this.authority.checkAdmin],
      this.updateSensitiveWord
    );
    this.router.delete(
      "/deleteSensitiveWord",
      [this.authority.checkAdmin],
      this.deleteSensitiveWord
    );
  };

  getSensitiveWord = async (req, res) => {
    const result = await SensitiveWord.find().catch(this.handleError);
    if (this.isError(result)) return this.fail(res);
    return this.success(res, {
      data: result
    });
  };

  addSensitiveWord = async (req, res) => {
    const { word } = req.body;
    const isValid = this.validator.validate(req.body, [
      {
        field: "word",
        type: "required"
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });
    const result = await SensitiveWord.findOneAndUpdate(
      { word },
      { word },
      { new: true, upsert: true }
    ).catch(this.handleError);
    if (this.isError(result)) return this.fail(res);
    Cache.del(CacheKeys.sensitiveWord);
    return this.success(res, {
      data: result
    });
  };

  updateSensitiveWord = async (req, res) => {
    const { word, id } = req.body;
    const isValid = this.validator.validate(req.body, [
      {
        field: "id",
        type: "isMongoId"
      },
      {
        field: "word",
        type: "required"
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });
    const result = await SensitiveWord.findByIdAndUpdate(
      id,
      { word },
      { new: true }
    ).catch(this.handleError);
    if (this.isError(result)) return this.fail(res);
    Cache.del(CacheKeys.sensitiveWord);
    return this.success(res, {
      data: result
    });
  };

  deleteSensitiveWord = async (req, res) => {
    const { id } = req.body;
    const isValid = this.validator.validate(req.body, [
      {
        field: "id",
        type: "isMongoId"
      }
    ]);
    if (!isValid)
      return this.fail(res, {
        status: 400
      });
    const result = await SensitiveWord.findByIdAndRemove(id, {
      new: true
    }).catch(this.handleError);
    if (this.isError(result)) return this.fail(res);
    Cache.del(CacheKeys.sensitiveWord);
    return this.success(res, {
      data: result
    });
  };
}

export default new SensitiveWordController().router;
