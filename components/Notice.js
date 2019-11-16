import _ from "lodash";
import { Mail } from "../componentsSingle";

class Notice {
  send = ({ title, text }) => {
    let info = "";
    if (_.isObjectLike(text)) {
      info = JSON.stringify(text);
    } else if (_.isString(text)) {
      info = text;
    }
    Mail.send({
      title,
      text: info
    });
  };
}
export default Notice;
