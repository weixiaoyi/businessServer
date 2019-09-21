import * as bip39 from "bip39";
import moment from "moment";
import _ from "lodash";
import { Router } from "../../components";
import { decryptString } from "../../utils";

class DecryptController extends Router {
  constructor(props) {
    super(props);
    this.init();
  }

  init = () => {
    this.router.all(
      "*",
      (req, res, next) => {
        console.log(req.path, "--p");
        if (req.path === "/pay/notify") next("route");
        if ("/fuye1000/api".test(req.path)) next("route");
        else next();
      },
      (req, res, next) => {
        try {
          if (!req.headers.authorization) {
            throw "1";
          }
          const decryptedData = decryptString(req.headers.authorization);
          if (!_.isString(decryptedData)) {
            throw "2";
          }
          const stringsArray = decryptedData.split(" ");
          if (stringsArray.length !== 13) {
            throw "3";
          }
          const mnemonic = stringsArray.slice(0, 12).join(" ");
          if (!bip39.validateMnemonic(mnemonic)) {
            throw "4";
          }
          const time = Number(stringsArray[12]);
          if (!_.isInteger(time) || !moment(moment(time)).isValid()) {
            throw "5";
          }
          if (moment(Date.now()).diff(moment(time), "seconds") >= 11) {
            throw "6";
          }
          req.decrypt = mnemonic;
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
