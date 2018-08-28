import { Injectable } from '@angular/core';
import { BasePostDraft, IAppState, MuzikaConsole, PostActionType } from '@muzika/core';
import { APIConfig, ParamsBuilder } from '../config';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';


@Injectable({ providedIn: 'root' })
export class PostDraftAction {
  static postDraftsObs: Observable<{ [boardType: string]: { [draftId: string]: BasePostDraft } }>;

  constructor(private store: Store<IAppState>,
              private apiConfig: APIConfig) {
    PostDraftAction.postDraftsObs = this.store.pipe(select(['post', 'postDrafts']));
  }

  loadPostDrafts(boardType: string) {
    return this.apiConfig
      .get<BasePostDraft[]>(`/draft`, {
        params: ParamsBuilder.from({ boardType })
      })
      .pipe(tap((drafts: BasePostDraft[]) => {
        MuzikaConsole.log(`Load ${boardType} draftbox from server`, drafts);

        drafts.forEach(draft => {
          this.store.dispatch({
            type: PostActionType.INSERT_POST_DRAFTS,
            payload: { boardType, draft }
          });
        });
      }));
  }

  // return draftId
  insertPostDraft(boardType: string, postDraft: BasePostDraft) {
    return this.apiConfig.post<number>(`/draft`, postDraft)
      .pipe(tap(() => {
        this.loadPostDrafts(boardType);
      }));
  }

  deletePostDraft(boardType: string, draftId: number) {
    return this.apiConfig.delete<boolean>(`/draft/${draftId}`)
      .pipe(tap(() => {
        this.loadPostDrafts(boardType);
      }));
  }

  updatePostDraft(boardType: string, draft: BasePostDraft) {
    return this.apiConfig
      .put<BasePostDraft>(`/draft/${draft.draft_id}`, draft)
      .pipe(tap(() => {
        this.loadPostDrafts(boardType);
        MuzikaConsole.log('Saved post to server!');
      }));
  }
}
