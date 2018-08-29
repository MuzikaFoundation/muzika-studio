import { Component } from '@angular/core';
import { BasePostDraft } from '@muzika/core';
import { BaseComponent, PostDraftAction, UserActions } from '@muzika/core/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';


@Component({
  selector: 'app-post-draft-list',
  templateUrl: './post-draft-list.component.html',
  styleUrls: [
    './post-draft-list.component.scss'
  ]
})
export class PostDraftListComponent extends BaseComponent {
  boardType: string;

  drafts: {
    [draftId: string]: BasePostDraft
  };

  constructor(private _router: Router,
              private _route: ActivatedRoute,
              private _postDraftActions: PostDraftAction) {
    super();
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

    // this._sub.push(
    //   this.test.subscribe(data => console.log(data))
    // );

    this._sub.push(
      combineLatest(
        this._route.params,
        PostDraftAction.postDraftsObs
      ).subscribe(([params, postDrafts]) => {
        this.boardType = params.type;

        if (postDrafts[this.boardType]) {
          this.drafts = postDrafts[this.boardType];
        }

        this._postDraftActions.loadPostDrafts(this.boardType);
      })
    );
  }

  openPostDraft(draftId: string) {
    this._router.navigate([`/board/${this.boardType}/write`], {
      queryParams: {
        id: draftId
      }
    });
  }
}
