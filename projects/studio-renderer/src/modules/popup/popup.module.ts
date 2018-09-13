import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { MuzikaCommonModule, MuzikaCoreModule } from '@muzika/core/angular';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { NgxUploaderModule } from 'ngx-uploader';
import { PopupRouteModule } from './popup.routes';
import { PopupLayoutComponent } from './popup-layout.component';
import { WebPopupComponent } from './components/web/web-popup.component';
import { WalletManagerComponent } from './components/wallet-manager/wallet-manager.component';

@NgModule({
  schemas: [ NO_ERRORS_SCHEMA ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MuzikaCommonModule,

    PopupRouteModule,

    MuzikaCoreModule,
    MatButtonModule,
    NgxUploaderModule,

    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot()
  ],
  declarations: [
    PopupLayoutComponent,
    WalletManagerComponent,
    WebPopupComponent,
  ],
  exports: [
  ]
})
export class PopupModule {

}
