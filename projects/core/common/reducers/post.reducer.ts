import { Action } from 'redux';
import { tassign } from 'tassign';
import { InfPaginationResult, PaginationResult } from '../models/pagination';
import { BasePost } from '../models/post';
import { PayloadAction } from '../models/redux-action';
import { BasePostDraft } from '../models/draftbox';

export class PostActionType {
  static INSERT_POSTS_LIST = '/posts/insert-posts-list';
  static INSERT_POSTS_BEFORE_LIST = '/posts/insert-posts-before-list';
  static INSERT_POSTS_AFTER_LIST = '/posts/insert-post-after-list';
  static INSERT_POSTS_RESULT = '/posts/insert-posts-result';
  static RESET_POSTS_RESULT = '/posts/reset-posts-result';
  static RESET_INF_POSTS = '/posts/reset-inf-posts';
  static LIKE_TOGGLE_POST = '/posts/like-toggle-post';
  static SAVE_POSTS = '/posts/save-posts';
  static INSERT_POST_DRAFTS = '/posts/insert-post-drafts';

  static PurchasedPosts(boardType: string) {
    return 'purchased-' + boardType;
  }

  static MyPosts(boardType: string) {
    return 'my-' + boardType;
  }

  static SearchedPosts(boardType: string) {
    return 'searched-' + boardType;
  }
}

export interface PostState {
  posts: {
    [type: string]: BasePost[]
  };
  postDrafts: {
    [boardType: string]: {
      [draft_id: string]: BasePostDraft
    };
  };
  postResult: {
    [type: string]: PaginationResult<BasePost>
  };
  infPosts: {
    [boardType: string]: InfPaginationResult<BasePost>
  };
  post: {
    [boardType: string]: {
      [postId: string]: BasePost
    }
  };
}

const initialState: PostState = {
  postResult: {
    community: { total: 0, page: [], list: [] },
    music: { total: 0, page: [], list: [] },
    video: { total: 0, page: [], list: [] }
  },
  posts: {},
  postDrafts: {},
  infPosts: {
    community: { after: null, before: null, list: [] },
    music: { after: null, before: null, list: [] },
    video: { after: null, before: null, list: [] }
  },
  post: {
    community: {}, music: {}, video: {}
  }
};

export interface PostLikeAction extends Action {
  boardType: string;
  boardID: string;
  diff: number;
}

export interface SavePostAction extends Action {
  boardType: string;
  boardID: string;
  posts: BasePost[];
  update_column: string;
}

function syncPostToState(postState, boardType, posts: BasePost[], update_column: string = null) {
  if (!update_column) {
    update_column = 'all';
  }

  return posts.map(post => {
    postState[boardType][post.post_id] = postState[boardType][post.post_id] || {};

    const attrs = update_column === 'all' ? Object.keys(post) : update_column.split(',');
    attrs.forEach(attr => {
      if (post.hasOwnProperty(attr) && postState[boardType][post.post_id][attr] !== post[attr]) {
        if (attr === 'content') {
          post.content = post.content.split('https://www.youtube.com/embed/').join('//www.youtube.com/embed/');
          post.content = post.content.split('//www.youtube.com/embed/').join('https://www.youtube.com/embed/');
        }
        postState[boardType][post.post_id][attr] = post[attr];
      }
    });

    return postState[boardType][post.post_id];
  });
}

function InfPaginationResultCombine<T>(target: InfPaginationResult<T>,
                                       source: InfPaginationResult<T>,
                                       insertType: 'after' | 'before',
                                       compareType: string | null = null): InfPaginationResult<T> {
  const nextResult: InfPaginationResult<any> = { list: [], after: null, before: null };

  switch (insertType) {
    case 'after':
      nextResult.list = [
        ...source.list,
        ...target.list
      ];
      break;
    case 'before':
      nextResult.list = [
        ...target.list,
        ...source.list
      ];
      break;
  }

  if (compareType !== null) {
    let prevPost = null;
    target.list = target.list.filter(post => {
      if (prevPost !== null && prevPost[compareType] === post[compareType]) {
        return false;
      }
      prevPost = post;
      return true;
    });
  }

  switch (insertType) {
    case 'after':
      nextResult.before = target.before || source.before;
      nextResult.after = source.after || target.after;

      break;
    case 'before':
      nextResult.after = target.after || source.after;
      nextResult.before = source.before || target.before;
      break;
  }

  return nextResult;
}

// Infinite Scroll list 처리
function postsActionState(state,
                          payload: {
                            boardType: string,
                            after: string,
                            before: string,
                            list: any
                          },
                          insertType: 'after' | 'before') {
  return tassign(state, {
    infPosts: tassign(state.infPosts, {
      [payload.boardType]: InfPaginationResultCombine<BasePost>(state.infPosts[payload.boardType],
        {
          after: payload.after,
          before: payload.before,
          list: syncPostToState(state.post, payload.boardType, payload.list)
        }, insertType, 'id')
    })
  });
}

export const PostReducer = function(state: PostState = initialState, _action: Action): PostState {
  const action: PayloadAction = <PayloadAction>_action;
  switch (_action.type) {
    case PostActionType.RESET_POSTS_RESULT:
      return tassign(state, {
        postResult: tassign(state.postResult, {
          [action.payload.boardType]: { total: 0, page: [], list: [] } as PaginationResult<BasePost>
        })
      });

    case PostActionType.RESET_INF_POSTS:
      return tassign(state, {
        infPosts: tassign(state.infPosts, {
          [action.payload.boardType]: { after: null, before: null, list: [] }
        })
      });

    case PostActionType.INSERT_POSTS_LIST:
      return tassign(state, {
        posts: tassign(state.posts, {
          [action.payload.boardType]: action.payload.list
        })
      });

    case PostActionType.INSERT_POST_DRAFTS:
      return tassign(state, {
        postDrafts: tassign(state.postDrafts, {
          [action.payload.boardType]: tassign(state.postDrafts[action.payload.boardType], {
            [action.payload.draft.draft_id]: action.payload.draft
          })
        })
      });

    case PostActionType.INSERT_POSTS_RESULT:
      return tassign(state, {
        postResult: tassign(state.postResult, {
          [action.payload.boardType]: <PaginationResult<BasePost>>{
            ...action.payload,
            ...{
              list: syncPostToState(state.post, action.payload.boardType, action.payload.list)
            }
          }
        })
      });

    case PostActionType.INSERT_POSTS_BEFORE_LIST:
      return postsActionState(state, action.payload, 'before');

    case PostActionType.INSERT_POSTS_AFTER_LIST:
      return postsActionState(state, action.payload, 'after');

    case PostActionType.SAVE_POSTS:
      const savePostAction = (<SavePostAction> _action);

      syncPostToState(state.post, savePostAction.boardType, savePostAction.posts, savePostAction.update_column);

      return tassign(state, {
        post: tassign(state.post, {
          [savePostAction.boardType]: tassign(state.post[savePostAction.boardType])
        })
      });

    case PostActionType.LIKE_TOGGLE_POST:
      const likePostAction = (<PostLikeAction> _action);

      if (state.post[likePostAction.boardType][likePostAction.boardID]) {
        state.post[likePostAction.boardType][likePostAction.boardID].likes += likePostAction.diff;
      }

      return state;

    default:
      return state;
  }
};
