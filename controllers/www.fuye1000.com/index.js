import { default as AnswerController } from "./answer";
import { default as AnswerDbController } from "./answerDb";
import { default as AnswerCommentController } from "./answerComment";
import { default as IdeaController } from "./idea";
const Controllers = app => {
  app.use("/fuye1000/api/answers", AnswerController);
  app.use("/fuye1000/api/answerDbs", AnswerDbController);
  app.use("/fuye1000/api/answerComments", AnswerCommentController);
  app.use("/fuye1000/api/ideas", IdeaController);
};

export default Controllers;
