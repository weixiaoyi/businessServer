import { default as AnswerController } from "./answer";
import { default as AnswerDbController } from "./answerDb";
const Controllers = app => {
  app.use("/fuye1000/api/answers", AnswerController);
  app.use("/fuye1000/api/answerDbs", AnswerDbController);
};

export default Controllers;
