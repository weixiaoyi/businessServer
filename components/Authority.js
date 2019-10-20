import Response from "./Response";
import Env from "./Env";
import { UserBlackList } from "../models";
import { Messages, SetReq } from "../constants";

class Authority extends Response {
  constructor(props) {
    super(props);
    this.env = new Env();
  }
  pass = req => {
    return (req.session && req.session.user) || this.env.isAdmin(req);
  };
  checkLogin = (req, res, next) => {
    if (this.pass(req)) {
      next();
    } else {
      return this.fail(res, {
        status: 401,
        code: -1,
        msg: "Unauthorized_RequiredLogin"
      });
    }
  };
  checkAdmin = (req, res, next) => {
    if (this.env.isAdmin(req)) {
      next();
    } else {
      return this.fail(res, {
        status: 401,
        code: -1,
        msg: "Unauthorized_NotAdmin"
      });
    }
  };
  checkUserBl = async (req, res, next) => {
    if (!req.session.user) {
      next();
    } else {
      const userBl = await UserBlackList.findOne({
        accountId: req.session.user._id
      }).catch(this.handleError);
      if (this.isError(userBl)) return this.fail(res);
      if (userBl) {
        if (userBl.type === "forbidden") {
          return this.fail(res, {
            msg: Messages.accountForbidden
          });
        }
        // req.blType = userBl.type; //暂时不需要挂载
        SetReq(req, "blIsNormal", userBl.type === "normal");
      } else {
        SetReq(req, "blIsNormal", true);
      }
      next();
    }
  };
  checkNotLogin = (req, res, next) => {
    if (req.session && req.session.user) {
      return this.fail(res, {
        status: 400,
        msg: "Bad Request"
      });
    } else {
      next();
    }
  };
}

export default Authority;
