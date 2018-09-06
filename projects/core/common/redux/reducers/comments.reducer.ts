import { tassign } from 'tassign';
import { PostComment } from '../../models/comment';
import { PaginationResult } from '../../models/pagination';
import { PayloadAction } from '../../models/redux-action';

export class CommentActionType {
  public static SET_COMMENTS_RESULT = '/comments/set-comments-result';
}

export interface CommentState {
  [key: string]: {
    [key: string]: PaginationResult<PostComment>
  };
}

export const initialState: CommentState = {
  community: {},
  music: {},
  video: {}
};

export const CommentReducer = function(state: CommentState = initialState, action: PayloadAction): CommentState {
  switch (action.type) {
    case CommentActionType.SET_COMMENTS_RESULT:
      return tassign(state, {
        [action.payload.boardType]: tassign(state[action.payload.boardType], {
          [action.payload.boardID]: tassign(action.payload.result)
        })
      });

    default:
      return state;
  }
};
