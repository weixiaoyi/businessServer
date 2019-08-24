import CryptoJS from "crypto-js";

export const decryptString = string => {
  try {
    const bytes = CryptoJS.AES.decrypt(string, "weixiaoyi");
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    return null;
  }
};
