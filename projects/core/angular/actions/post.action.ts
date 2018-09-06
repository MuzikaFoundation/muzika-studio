import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BasePost, IAppState, InfPaginationResult, MuzikaConsole, PaginationResult, PostActionType } from '@muzika/core';
import { from, Observable } from 'rxjs';
import { APIConfig } from '../config/api.config';
import { ParamsBuilder } from '../config/params.builder';
import { MuzikaCoin } from '../contracts/interface/MuzikaCoin';
import { MuzikaPaperContract } from '../contracts/interface/MuzikaPaperContract';
import { UserActions } from './user.action';
import { select, Store } from '@ngrx/store';

@Injectable({ providedIn: 'root' })
export class PostActions {
  constructor(private store: Store<IAppState>,
              private apiConfig: APIConfig,
              private userActions: UserActions,
              private muzikaPaper: MuzikaPaperContract,
              private muzikaCoin: MuzikaCoin,
              @Inject(PLATFORM_ID) private platformId) {
  }

  write(boardType, post): Observable<any> {
    return this.apiConfig.post(`/board/${boardType}`, post);
  }

  visit(boardType: string, boardID: number) {
    if (isPlatformBrowser(this.platformId)) { // Server side rendering에서는 업데이트 안함
      this.apiConfig.post('board/row/update', { boardType, boardID }).subscribe();
    }
  }

  remove(boardType: string, boardID: number) {
    return this.apiConfig.delete(`/board/${boardType}/${boardID}`);
  }

  /**
   * Purchase music. If success, returns transaction hash
   *
   * @param {string} contractAddress
   * @param {string} buyer
   * @returns {Observable<string>} transaction hash
   */
  purchase(contractAddress: string, buyer: string): Observable<string> {
    const func = async () => {
      const coin = await this.muzikaCoin.deployed();
      const paper = await this.muzikaPaper.at(contractAddress);
      const price = (await paper.price()).toString(10);
      const estimateGas = await coin.increaseApprovalAndCall.estimateGas(
        contractAddress,
        price,
        '0x',
        { from: buyer }
      );
      return await coin.increaseApprovalAndCall.sendTransaction(
        contractAddress,
        price,
        '0x',
        { from: buyer, gas: estimateGas + 30000 }
      );
    };

    return from(func());
  }

  resetPosts(boardType: string) {
    return {
      type: PostActionType.RESET_POSTS_RESULT,
      payload: { boardType }
    };
  }

  resetInfPosts(boardType: string) {
    return {
      type: PostActionType.RESET_INF_POSTS,
      payload: { boardType }
    };
  }

  loadPost(boardType, boardID) {
    this.apiConfig.get<BasePost>(`/board/${boardType}/${boardID}`)
      .subscribe(
        (post) => {
          this.store.dispatch({
            type: PostActionType.SAVE_POSTS,
            boardType,
            update_column: 'all',
            posts: [post]
          });
          this.visit(boardType, +boardID);
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // A client-side or network error occurred. Handle it accordingly.
            MuzikaConsole.log('An error occurred:', err.error.message);
          } else {
            MuzikaConsole.log(`Backend returned code ${err.status}, body was: ${err.error}`);
          }
        });
  }

  loadInfPosts(boardType: string, mode: string, params: Object) {
    this.store.pipe(select(state => state.post.infPosts[boardType]))
      .subscribe(currentPosts => {
        if (mode === 'after' && currentPosts.after !== null) {
          params['after'] = currentPosts.after;
        } else if (currentPosts.before !== null) {
          params['before'] = currentPosts.before;
        }
        this._requestPosts(boardType,
          (mode === 'after') ? PostActionType.INSERT_POSTS_AFTER_LIST : PostActionType.INSERT_POSTS_BEFORE_LIST,
          params);
      });
  }

  loadPosts(boardType: string, page: string, params: Object) {
    params['page'] = page;
    this._requestPosts(boardType, PostActionType.INSERT_POSTS_RESULT, params);
  }

  private _requestPosts(boardType: string, dispatchType: string, params: Object) {
    this.apiConfig
      .get<PaginationResult<BasePost> | InfPaginationResult<BasePost>>(`/board/${boardType}`, {
        params: ParamsBuilder.from(params)
      })
      .subscribe((data: any) => {
        // trigger post inserting
        this.store.dispatch({
          type: dispatchType,
          payload: Object.assign(data, { boardType })
        });
      });
  }
}
