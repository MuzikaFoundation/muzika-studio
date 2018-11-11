import { Component } from '@angular/core';
import { BasePostDraft } from '@muzika/core';
import { BaseComponent, PostDraftAction, UserActions } from '@muzika/core/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';


@Component({
  selector: 'post-selection',
  templateUrl: './post-selection.component.html',
  styleUrls: [
    './post-selection.component.scss'
  ]
})
export class PostSelectionComponent extends BaseComponent {
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
  }

  goToSelection(which: 'sheet' | 'streaming') {
    this._router.navigate([`/board/${which}/write`]);
  }

}
