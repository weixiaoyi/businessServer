import _ from "lodash";
import validator from "validator";
import FastScanner from "fastscan";
import Response from "./Response";
import { SensitiveWord } from "../models";
import { Cache } from "../componentsSingle";
import { CacheKeys } from "../constants";

class Validator extends Response {
  validate = (paramsPayload, arrays) => {
    return arrays.every(item => {
      let value = null;
      if (paramsPayload) {
        if (paramsPayload[[item.field]] && paramsPayload[[item.field]].trim) {
          paramsPayload[[item.field]] = paramsPayload[[item.field]].trim();
        }
        if (_.isFunction(item.transform)) {
          paramsPayload[[item.field]] = item.transform(
            paramsPayload[[item.field]]
          );
        }
        value = paramsPayload[[item.field]];
      } else {
        if (_.isFunction(item.transform)) {
          item.value = item.transform(item.value);
        }
        value = item.value;
      }

      if (paramsPayload && !(item && item.field)) {
        console.error("validate参数错误,field必须存在");
      }
      if (!item.type) return true;
      if (item.type === "required") {
        return value !== null && value !== undefined;
      } else if (_.isFunction(item.validator)) {
        return item.validator(value);
      } else if (_.isFunction(validator[[item.type]])) {
        if (value === null || value === undefined) {
          return false;
        }
        return validator[[item.type]](
          value,
          item.payload ? item.payload : undefined
        );
      }
      return false;
    });
  };
  checkSensitiveSafe = async (...wordList) => {
    let words = [];
    if (Cache.get(CacheKeys.sensitiveWord)) {
      words = Cache.get(CacheKeys.sensitiveWord);
    } else {
      words = await SensitiveWord.find(null, "word").catch(this.handleError);
      Cache.set(CacheKeys.sensitiveWord, words);
    }

    if (this.isError(words) || this.isNull(words)) {
      return false;
    }
    words = words.map(item => item.word);
    const scanner = new FastScanner(words);
    return wordList.every(item => {
      const hits = scanner.hits(item);
      return !_.keys(hits).length;
    });
  };
}
export default Validator;
