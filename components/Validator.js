import _ from "lodash";
import validator from "validator";

class Validator {
  validate = (paramsPayload, arrays) => {
    return arrays.every(item => {
      if (_.isFunction(item.transform)) {
        paramsPayload[[item.field]] = item.transform(
          paramsPayload[[item.field]]
        );
      }
      const value = paramsPayload[[item.field]];
      if (!(item && item.field)) {
        console.error("validate参数错误,field必须存在");
      }
      if (!item.type) return true;
      if (item.type === "required") {
        return value !== null && value !== undefined;
      } else if (_.isFunction(item.validator)) {
        return item.validator(value);
      } else if (_.isFunction(validator[[item.type]])) {
        return validator[[item.type]](
          value,
          item.payload ? item.payload : undefined
        );
      }
      return false;
    });
  };
}

export default Validator;
