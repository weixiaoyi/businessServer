import express from "express";
import _ from "lodash";
import Response from "./Response";

class Router extends Response {
  constructor(props) {
    super(props);
    this.router = express.Router();
    this.init();
  }

  init = () => {
    this.router.get(
      "/",
      (...payload) => _.isFunction(this.get) && this.get(...payload)
    );
    this.router.post(
      "/",
      (...payload) => _.isFunction(this.post) && this.post(...payload)
    );
  };

  get = () => {
    console.log("get");
  };

  post = () => {
    console.log("post");
  };
}

export default Router;
