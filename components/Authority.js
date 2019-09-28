import Response from "./Response";
class Authority extends Response {
  checkLogin = (req, res, next) => {
    if ((req.session && req.session.user) || req.headers.signature) {
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
    if (req.headers.signature) {
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
