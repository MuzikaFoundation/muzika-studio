import { Inject, Injectable } from '@angular/core';
import {
  ERR,
  IAppState,
  MusicPost,
  MuzikaPlatformType,
  PaginationResult,
  PostActionType,
  promisify,
  User,
  UserActionType
} from '@muzika/core';
import { from, Observable, of } from 'rxjs';
import { catchError, concatMap, map, tap } from 'rxjs/operators';
import { APIConfig } from '../config/api.config';
import { PLATFORM_TYPE_TOKEN } from '../config/injection.tokens';
import { ExtendedWeb3 } from '../providers/extended-web3.provider';
import { LocalStorage } from '../providers/local-storage.service';
import { select, Store } from '@ngrx/store';

@Injectable({ providedIn: 'root' })
export class UserActions {
  public static currentUserObs: Observable<User>;

  public static purchasedSheetPostsObs: Observable<MusicPost[]>;

  public static purchasedStreamingPostsObs: Observable<MusicPost[]>;

  public static mySheetPostsObs: Observable<PaginationResult<MusicPost>>;

  public static myStreamingPostsObs: Observable<PaginationResult<MusicPost>>;

  constructor(private store: Store<IAppState>,
              private apiConfig: APIConfig,
              private web3: ExtendedWeb3,
              private localStorage: LocalStorage,
              @Inject(PLATFORM_TYPE_TOKEN) private platformType: MuzikaPlatformType) {
    UserActions.currentUserObs = this.store.pipe<User>(select(state => state.user.currentUser));
    UserActions.purchasedSheetPostsObs = this.store.pipe<MusicPost[]>(
      select<IAppState>(state => state.post.posts[PostActionType.PurchasedPosts('sheet')])
    );
    UserActions.purchasedStreamingPostsObs = this.store.pipe<MusicPost[]>(
      select<IAppState>(state => state.post.posts[PostActionType.PurchasedPosts('streaming')])
    );
    UserActions.mySheetPostsObs = this.store.pipe<PaginationResult<MusicPost>>(
      select<IAppState>(state => state.post.postResult[PostActionType.MyPosts('sheet')])
    );
    UserActions.myStreamingPostsObs = this.store.pipe<PaginationResult<MusicPost>>(
      select<IAppState>(state => state.post.postResult[PostActionType.MyPosts('streaming')])
    );
  }

  loadPurchasedPosts(boardType: 'sheet' | 'streaming') {
    return this.apiConfig.get<MusicPost[]>(`/user/board/${boardType}/purchased`)
      .pipe(map(result => {
        this.store.dispatch({
          type: PostActionType.INSERT_POSTS_LIST,
          payload: {
            boardType,
            total: result.length,
            list: result,
            page: []
          }
        });
        return result;
      }));
  }

  loadMyPosts(boardType: string, page: number, params: Object = {}) {
    params['page'] = page;
    return this.apiConfig.get<PaginationResult<MusicPost>>(`/user/board/${boardType}`)
      .pipe(map(result => {
        this.store.dispatch({
          type: PostActionType.INSERT_POSTS_RESULT,
          payload: Object.assign(result, { boardType })
        });
        return result;
      }));
  }

  refreshMe(): Observable<User> {
    return this.apiConfig.get<User>('/me').pipe(
      map(user => {
        this.store.dispatch({
          type: UserActionType.SET_CURRENT_USER,
          payload: user
        });

        this.loadPurchasedPosts('sheet').subscribe();
        this.loadPurchasedPosts('streaming').subscribe();

        return user;
      }),
      catchError(err => {
        if (err.error && err.error.state === ERR.CODE.INVALID_SIGNATURE) {
          this.localStorage.removeItem('token');
        }
        if (err.status === ERR.CODE.AUTHENTICATION_FAILED) {
          this.localStorage.removeItem('token');
        }
        return of(null);
      })
    );
  }

  register(address: string, message: string, signature: string, user_name: string): Observable<User> {
    return this.apiConfig.post<string>(`/register`, { address, message, signature, user_name }).pipe(
      map(token => {
        if (token) {
          this.localStorage.setItem('token', token);
        }

        return token;
      }),
      concatMap(token => this.refreshMe())
    );
  }

  modifyUserInfo(userInfo: User): Observable<User> {
    return this.apiConfig.put<string>(`/user`, userInfo)
      .pipe(concatMap(response => this.refreshMe()));
  }

  login(address: string): Observable<User> {
    const messagePrefix = `Login to Muzika!\nSignature: `;
    return this.apiConfig.get(`/user/${address}/sign-message`).pipe(
      concatMap((message) => {
        return from(promisify(
          this.web3.personal.sign,
          this.web3.toHex(messagePrefix + message),
          address
        ));
      }),
      concatMap((signature) => {
        return this.apiConfig
          .post<string>(`/login`, { address, signature, platform_type: this.platformType })
          .pipe(
            tap(token => {
              if (token) {
                this.localStorage.setItem('token', token);
              }
            })
          );
      }),
      concatMap(token => this.refreshMe())
    );
  }

  logout() {
    this.localStorage.removeItem('token');
    this.store.dispatch({
      type: UserActionType.SET_CURRENT_USER,
      payload: null
    });
    ['sheet', 'streaming'].forEach(type => {
      this.store.dispatch({
        type: PostActionType.RESET_POSTS_RESULT,
        payload: PostActionType.PurchasedPosts(type)
      });
      this.store.dispatch({
        type: PostActionType.RESET_POSTS_RESULT,
        payload: PostActionType.MyPosts(type)
      });
    });
    // 게시글 좋아요 목록 리셋
    this.store.dispatch({
      type: UserActionType.SET_BOARD_LIKES,
      likes: { free: [], video: [], music: [] }
    });
    // 댓글 좋아요 목록 리셋
    this.store.dispatch({
      type: UserActionType.SET_COMMENT_LIKES,
      likes: { free: [], video: [], music: [] }
    });
  }

}
