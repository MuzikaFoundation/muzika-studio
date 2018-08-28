import { CommentReducer, CommentState } from './comments.reducer';
import { PostReducer, PostState } from './post.reducer';
import { UserReducer, UserState } from './user.reducer';
import { AppReducer, AppState } from './app.reducer';

export * from './app.reducer';
export * from './user.reducer';
export * from './post.reducer';
export * from './comments.reducer';

export interface IAppState {
  app: AppState;
  post: PostState;
  comment: CommentState;
  user: UserState;
}

export const rootReducer = {
  app: AppReducer,
  post: PostReducer,
  comment: CommentReducer,
  user: UserReducer
};
