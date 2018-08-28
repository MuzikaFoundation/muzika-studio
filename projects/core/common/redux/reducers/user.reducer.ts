import { tassign } from 'tassign';
import { User } from '../../models/index';
import { PayloadAction } from '../../models/redux-action';

export class UserActionType {
  static SET_CURRENT_USER = '/user/set-current-user';
  static SET_BOARD_LIKES = '/user/set-board-likes';
  static SET_COMMENT_LIKES = '/user/set-comment-likes';
}

export interface UserState {
  currentUser: User;

  boardLikes: {
    community: number[],
    music: number[],
    video: number[]
  };
  commentLikes: {
    community: number[],
    music: number[],
    video: number[]
  };
}

const initialState: UserState = {
  currentUser: null,
  boardLikes: {community: [], music: [], video: []},
  commentLikes: {community: [], music: [], video: []},
};

export function UserReducer(state: UserState = initialState, action: PayloadAction): UserState {
  switch (action.type) {
    case UserActionType.SET_CURRENT_USER:
      return tassign(state, {
        currentUser: (action.payload) ? tassign(action.payload) : null
      });

    case UserActionType.SET_BOARD_LIKES:
    case UserActionType.SET_COMMENT_LIKES:
      const boardType = action.payload.boardType;

      if (action.type === UserActionType.SET_COMMENT_LIKES) {
        return tassign(state, {
          commentLikes: tassign(state.commentLikes, {[boardType]: action.payload.likes})
        });
      } else {
        return tassign(state, {
          boardLikes: tassign(state.boardLikes, {[boardType]: action.payload.likes})
        });
      }

    default:
      return state;
  }
}
