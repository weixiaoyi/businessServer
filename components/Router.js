import express from "express";
import Response from "./Response";

class Router extends Response {
  constructor(props) {
    super(props);
    this.router = express.Router();
  }
}

export default Router;
