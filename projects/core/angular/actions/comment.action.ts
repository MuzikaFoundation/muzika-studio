import { Injectable } from '@angular/core';
import { CommentActionType, IAppState, PaginationResult, PostComment } from '@muzika/core';
import { Observable } from 'rxjs';
import { APIConfig } from '../config/api.config';
import { ParamsBuilder } from '../config/params.builder';
import { UserActions } from './user.action';
import { Store } from '@ngrx/store';

@Injectable({ providedIn: 'root' })
export class CommentActions {

  constructor(private store: Store<IAppState>,
              private userAction: UserActions,
              private apiConfig: APIConfig) {
  }

  /** @experimental */
  getComments(boardType, boardID, currentPage) {
    const params = ParamsBuilder.from({
      boardType, boardID, currentPage
    });
    this.apiConfig
      .get<PaginationResult<PostComment>>(`/board/${boardType}/${boardID}/comment`, { params })
      .subscribe(result => {
        this.store.dispatch({
          type: CommentActionType.SET_COMMENTS_RESULT,
          payload: {
            boardType, boardID, result
          }
        });
      });
  }

  write(boardType: string, boardID: number, parent_comment_id: number, content: string): Observable<any> {
    return this.apiConfig.post(`/board/${boardType}/${boardID}/comment`, {
      parent_comment_id, content
    });
  }

  remove(boardType: string, commentID: number): Observable<any> {
    return this.apiConfig.delete(`/board/${boardType}/comment/${commentID}`);
  }
}
