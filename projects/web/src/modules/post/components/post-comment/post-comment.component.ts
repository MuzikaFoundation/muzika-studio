import { Component, ElementRef, Inject, Input, NgZone, PLATFORM_ID } from '@angular/core';
import { AbstractPostCommentComponent, CommentActions, PostActions } from '@muzika/core/angular';
import { PostCommentsMock } from '../../../../mock/comments';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-post-comment',
  templateUrl: './post-comment.component.html',
  styleUrls: ['./post-comment.component.scss']
})
export class PostCommentComponent extends AbstractPostCommentComponent {
  @Input()
  boardType: 'community' | 'music' | 'video';
  @Input()
  boardID: number;

  constructor(protected commentAction: CommentActions,
              protected postActions: PostActions,
              protected store: Store<WebAppState>,
              @Inject(PLATFORM_ID) protected platformId,
              protected element: ElementRef,
              protected zone: NgZone) {
    super(commentAction, postActions, store, platformId, element, zone);

    this.commentResult = {
      list: PostCommentsMock,
      page: []
    };
  }
}
