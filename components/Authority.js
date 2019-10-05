import Response from "./Response";
import Env from "./Env";

class Authority extends Response {
  constructor(props) {
    super(props);
    this.env = new Env();
  }
  checkLogin = (req, res, next) => {
    if ((req.session && req.session.user) || this.env.isAdmin(req)) {
      next();
    } else {
      return this.fail(res, {
        status: 401,
        code: -1,
        msg: "Unauthorized_RequiredLogin"
      });
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
}

export default Authority;
