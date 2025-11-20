import { QuizItem } from './QuizItem';

export type RootStackParamList = {
  Home: undefined;
  KeywordList: undefined;
  Quiz: undefined;
  Settings: undefined;
  KeywordEraQuizScreen: undefined;
  KeywordDetail: {
    keyword: QuizItem;
  };
};
