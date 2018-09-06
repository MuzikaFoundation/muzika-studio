import { Component, Injector } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BasePost, BasePostDraft, CommunityPost, CommunityPostDraft, VideoPost, VideoPostDraft } from '@muzika/core';
import { BaseComponent, PostActions, PostDraftAction, UserActions } from '@muzika/core/angular';
import { AlertifyInstnace } from '@muzika/core/browser';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { RendererAppState } from '../../../../reducers';

export class BasePostWriteComponent extends BaseComponent {

  post: BasePostDraft = {
    tags: []
  };

  // override boardType in the classes extending this base component.
  boardType = '';

  private _store: Store<RendererAppState>;
  private _router: Router;
  private _route: ActivatedRoute;
  private _postActions: PostActions;
  private _postDraftActions: PostDraftAction;

  constructor(injector: Injector) {
    super();
    this._store = injector.get<Store<RendererAppState>>(Store);
    this._route = injector.get<ActivatedRoute>(ActivatedRoute);
    this._router = injector.get<Router>(Router);
    this._postActions = injector.get<PostActions>(PostActions);
    this._postDraftActions = injector.get<PostDraftAction>(PostDraftAction);
  }

  ngOnInit() {
    super.ngOnInit();

    this._sub.push(
      UserActions.currentUserObs
        .subscribe(user => {
          if (!user) {
            // this._router.navigateByUrl('/login', {
            //   queryParams: {
            //     redirectTo: this._router.url
            //   }
            // });
          }
        })
    );

    this._sub.push(
      combineLatest(
        this._route.queryParams,
        PostDraftAction.postDraftsObs
          .pipe(map(drafts => drafts[this.boardType]))
      ).subscribe(([params, postDrafts]) => {
        const draftId = params['draftId'];

        // draftId가 있는 상태에서 this.post의 draftId가 다른 경우 (아직 assign되지 않은 경우)
        if (postDrafts && postDrafts[draftId] && postDrafts[draftId] !== this.post.draft_id) {
          this.post = postDrafts[draftId];
        }
      })
    );

    this._postDraftActions.loadPostDrafts(this.boardType);
  }

  addTag(name: string) {
    name = name.toLowerCase();
    if (/^[a-z0-9.]+$/.test(name) && this.post.tags.findIndex(tag => tag === name) === -1) {
      this.post.tags.push(name);

      return true;
    }

    return false;
  }

  removeTag(index: number) {
    this.post.tags.splice(index, 1);
  }

  handleTagInput(event: any, dom: any) {
    if (event.charCode === 13 && this.addTag(dom.value)) {
      dom.value = '';
    }
  }

  /* @TODO Implement functions */
  submit(form: NgForm): void {
    const prepared = this.prepare(form);

    if (prepared !== null) {
      return;
    }

    return;
  }

  savePost() {
    if (!this.post.title) {
      AlertifyInstnace.alert('Fill the title to save.');
      return;
    }

    if (this.post.draft_id) {
      this._postDraftActions
        .updatePostDraft(this.boardType, this.post)
        .subscribe();
    } else {
      this._postDraftActions
        .insertPostDraft(this.boardType, this.post)
        .subscribe(draft_id => {
          this.post.draft_id = draft_id;
        });
    }
  }

  protected _resetPost() {
    this.post = <BasePostDraft>{
      type: 'streaming',
      tags: [],
      price: 0,
      files: []
    };
  }

  protected prepare(form: NgForm): BasePostDraft | null {
    const c = form.controls;

    if (c.title.invalid) {
      AlertifyInstnace.alert('Fill the blank in title');
    } else if (!this.post.content) {
      AlertifyInstnace.alert('Fill content');
    } else {
      /* All of elements are passed */
      return this.post;
    }

    return null;
  }

  goToStep(step: number) {
    switch (step) {
      case 1:

        break;
      case 2:
        break;
      case 3:
        break;
    }
  }
}

@Component({
  selector: 'app-post-community-write',
  templateUrl: './community/post-community-write.component.html',
  styleUrls: ['./post-write.scss', './community/post-community-write.component.scss']
})
export class PostCommunityWriteComponent extends BasePostWriteComponent {
  boardType = 'community';
  post: CommunityPostDraft;

  constructor(private injector: Injector) {
    super(injector);
  }

  prepare(form: NgForm): BasePost {
    const prepared = <CommunityPost>super.prepare(form);

    if (prepared === null) {
      return null;
    }

    return prepared;
  }
}


@Component({
  selector: 'app-post-video-write',
  templateUrl: './video/post-video-write.component.html',
  styleUrls: ['./post-write.scss', './video/post-video-write.component.scss']
})
export class PostVideoWriteComponent extends BasePostWriteComponent {
  boardType = 'video';
  post: VideoPostDraft;
  youtubeUrlRegExp = /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w-_]+)/;
  currentYoutubeVideoId: string;

  constructor(private injector: Injector) {
    super(injector);
  }

  onChangeYoutubeURL(url: string) {
    const videoId = this.youtubeUrlRegExp.exec(url);

    if (!!videoId && !!videoId[1] && videoId[1].length > 0) {
      this.currentYoutubeVideoId = videoId[1];
    } else {
      this.currentYoutubeVideoId = null;
    }

    this.post.youtube_url = url;
  }

  prepare(form: NgForm): BasePost {
    const prepared = <VideoPost>super.prepare(form);

    if (prepared === null) {
      return null;
    }

    if (!this.youtubeUrlRegExp.test(this.post.youtube_url)) {
      AlertifyInstnace.alert('Invalid Youtube URL');
      return null;
    }

    return prepared;
  }

  protected _resetPost() {
    super._resetPost();
    this.post.youtube_url = '';
  }
}
