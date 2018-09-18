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
import { WalletGeneratorComponent } from './components/wallet-generator/wallet-generator.component';
import { WalletCallComponent } from './components/wallet-call/wallet-call.component';

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
    WalletGeneratorComponent,
    WalletCallComponent,
    WebPopupComponent,
  ],
  exports: [
  ]
})
export class PopupModule {

}
