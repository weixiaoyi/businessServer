import { default as AnswerController } from "./answer";
const Controllers = app => {
  app.use("/fuye1000/api/answers", AnswerController);
};

export default Controllers;
