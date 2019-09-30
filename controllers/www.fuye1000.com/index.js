import { default as AnswerController } from "./answer";
import { default as AnswerDbController } from "./answerDb";
import { default as AnswerCommentController } from "./answerComment";
import { default as IdeaController } from "./idea";
import { default as IdeaCommentController } from "./ideaComment";
const Controllers = app => {
  app.use("/fuye1000/api/answers", AnswerController);
  app.use("/fuye1000/api/answerDbs", AnswerDbController);
  app.use("/fuye1000/api/answerComments", AnswerCommentController);
  app.use("/fuye1000/api/ideas", IdeaController);
  app.use("/fuye1000/api/ideaComments", IdeaCommentController);
};

export default Controllers;
