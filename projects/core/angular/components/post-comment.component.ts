import { isPlatformBrowser } from '@angular/common';
import { ElementRef, NgZone, OnChanges, SimpleChanges } from '@angular/core';
import { IAppState, MuzikaConsole, PaginationResult, PostComment, User } from '@muzika/core';
import { AlertifyInstnace } from '@muzika/core/browser';
import { combineLatest, Subscription } from 'rxjs';
import { CommentActions } from '../actions/comment.action';
import { PostActions } from '../actions/post.action';
import { BaseComponent } from './base.component';
import { UserActions } from '../actions';
import { select, Store } from '@ngrx/store';

export abstract class AbstractPostCommentComponent extends BaseComponent implements OnChanges {
  boardType: string;
  boardID: number;
  activeCommentID: string | null;

  commentResult: PaginationResult<PostComment>;

  currentUser: User;

  replyShow: { [key: number]: boolean };
  modifyShow: { [key: number]: any };
  replyContent: { [key: number]: string };
  writtenContent: string;

  _commentSub: Subscription;
  currentCommentPage: number;

  constructor(protected commentAction: CommentActions,
              protected postActions: PostActions,
              protected store: Store<IAppState>,
              protected platformId: any,
              protected element: ElementRef,
              protected zone: NgZone) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    this.writtenContent = '';
    this.replyShow = {};
    this.modifyShow = {};
    this.replyContent = {};

    this._sub.push(
      UserActions.currentUserObs.subscribe((user: User) => {
        this.currentUser = user;
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    let is_changed = false;
    for (const propName in changes) {
      const chng = changes[propName];
      if ((propName === 'boardID' || propName === 'boardType') && chng.currentValue !== chng.previousValue) {
        is_changed = true;
      }
    }
    if (is_changed) {
      this.setCommentSub();
    }
  }

  ngOnDestroy(): void {
    if (this._commentSub) {
      this._commentSub.unsubscribe();
    }
    super.ngOnDestroy();
  }

  loadComments(page = 0) {
    let pageQuery: string;
    if (!this.activeCommentID) {
      pageQuery = 'page-';
      if (page === 0) {
        pageQuery += this.currentCommentPage;
      } else {
        pageQuery += this.currentCommentPage = page;
      }
    } else {
      pageQuery = `comment-${this.activeCommentID}`;
    }
    this.commentAction.getComments(this.boardType, this.boardID, pageQuery);
  }

  setCommentSub() {
    if (!this.boardType || !this.boardID) {
      return;
    }
    if (this._commentSub) {
      this._commentSub.unsubscribe();
    }

    this._commentSub = combineLatest<PaginationResult<PostComment>, number[]>(
      this.store.pipe(select(state => state.comment[this.boardType][this.boardID])),
      this.store.pipe(select(state => state.user.commentLikes[this.boardType]))
    ).subscribe(([commentResult, commentLikes]) => {
      if (!!commentResult) {
        commentResult.list = commentResult.list.map(comment => {
          comment.my_like = (commentLikes.indexOf(comment.comment_id) !== -1);
          if (comment.reply_cnt > 0) {
            comment.reply_list = comment.reply_list.map(reply => {
              reply.my_like = (commentLikes.indexOf(reply.comment_id) !== -1);
              return reply;
            });
          }
          return comment;
        });
        if (!this.commentResult) { // 최초로 comments 렌더링 할 때
          this.commentResult = commentResult;
          this.goToActiveComment();
        } else {
          this.commentResult = commentResult;
        }
      }
    });

    this.loadComments(1);
  }

  goToActiveComment() {
    if (isPlatformBrowser(this.platformId) &&
      !!this.activeCommentID &&
      this.commentResult &&
      this.commentResult.list.length > 0) {

      this.zone.runOutsideAngular(() => {
        setTimeout(() => {

          const commentElem = this.element.nativeElement.querySelector('#comment-section-' + this.activeCommentID);
          MuzikaConsole.log(commentElem);
          if (commentElem) {
            commentElem.scrollIntoView(true);
            commentElem.classList.add('active');
          }

          this.activeCommentID = null;
        }, 300);
      });
    }
  }

  write(commentID, content) {
    if (!this.currentUser) {
      AlertifyInstnace.alert('로그인 후 이용 가능합니다.');
      return;
    }

    this.commentAction
      .write(this.boardType, this.boardID, commentID, content)
      .subscribe(res => {
        if (res.result === 'success') {
          if (commentID === null) {
            this.writtenContent = '';
            this.loadComments(1);
          } else {
            this.replyContent[commentID] = '';
            this.replyShow[commentID] = false;
            this.loadComments();
          }
        } else {
          AlertifyInstnace.alert(res.msg);
        }
      }, err => {
        MuzikaConsole.log(err);
      });
  }

  remove(commentID) {
    if (!this.currentUser) {
      AlertifyInstnace.alert('로그인 후 이용 가능합니다.');
      return;
    }

    AlertifyInstnace
      .confirm('댓글 삭제', '정말 삭제하시겠습니까? \n 삭제 시 복구 불가능합니다.',
        () => {
          this.commentAction.remove(this.boardType, commentID)
            .subscribe(res => {
              AlertifyInstnace.alert(res.msg);
              if (res.result === 'success') {
                this.loadComments();
              }
            });
        }
      );
  }
}
