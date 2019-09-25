import { default as AnswerController } from "./answer";
import { default as AnswerDbController } from "./answerDb";
import { default as AnswerCommentController } from "./answerComment";
const Controllers = app => {
  app.use("/fuye1000/api/answers", AnswerController);
  app.use("/fuye1000/api/answerDbs", AnswerDbController);
  app.use("/fuye1000/api/answerComments", AnswerCommentController);
};

export default Controllers;
