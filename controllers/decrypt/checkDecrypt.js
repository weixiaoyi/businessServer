import * as bip39 from "bip39";
import moment from "moment";
import _ from "lodash";
import { decryptString } from "../../utils";

export const checkDecrypt = authorization => {
  if (!authorization) {
    throw "1";
  }
  const decryptedData = decryptString(authorization);
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
  return mnemonic;
};
