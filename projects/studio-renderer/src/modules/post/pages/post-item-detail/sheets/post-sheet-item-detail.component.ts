import { Component, Injector } from '@angular/core';
import { PostActions } from '@muzika/core/angular';
import { IpcRendererService } from '../../../../../providers/ipc-renderer.service';
import { AlertifyInstnace } from '@muzika/core/browser';
import { AbstractPostMusicItemDetail } from '../post-music-item-detail';
import { RendererAppState } from '../../../../../reducers';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-post-sheet-item-detail',
  templateUrl: './post-sheet-item-detail.component.html',
  styleUrls: ['../post-item-detail.scss', './post-sheet-item-detail.component.scss']
})
export class PostSheetItemDetailComponent extends AbstractPostMusicItemDetail {

  constructor(public postActions: PostActions,
              public store: Store<RendererAppState>,
              public ipcRenderer: IpcRendererService,
              private injector: Injector) {
    super('music', injector);
  }

  purchase() {
    AlertifyInstnace.confirm('Are you sure to purchase this music?', this._purchase.bind(this));
  }

  sheetView() {
    if (!this.isPurchased) {
      AlertifyInstnace.alert('Should purchase first to download file');
      return;
    } else {
      this.ipcRenderer.openPDFViewer(this.post.music_contract.contract_address);
    }
  }

  private _purchase() {
    this.postActions
      .purchase(this.post.music_contract.contract_address, this.currentUser.address)
      .subscribe(
        txHash => {
          // @TODO process after purchase
        },
        err => {
          AlertifyInstnace.alert(err.message);
          console.error(err);
        }
      );
  }
}
