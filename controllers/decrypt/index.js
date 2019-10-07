import { Router } from "../../components";
import { checkDecrypt } from "./checkDecrypt";

class DecryptController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.router.all(
      "*",
      (req, res, next) => {
        if (req.path === "/pay/notify" || req.path === "/pay/testNotify")
          next("route");
        else next();
      },
      (req, res, next) => {
        try {
          req.decrypt = checkDecrypt(req.headers.authorization);
          req.headers.signature && checkDecrypt(req.headers.signature);
          next();
        } catch (e) {
          console.log("伪造请求", e);
          return this.fail(res, {
            msg: "Bad Request",
            status: 400
          });
        }
      }
    );
  };
}

export default new DecryptController().router;
