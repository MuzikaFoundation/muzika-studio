import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { MuzikaCommonModule, MuzikaCoreModule } from '@muzika/core/angular';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { AppHomeRouteModule } from './home.routes';
import { HomeLayoutComponent } from './layout/home-layout.component';
import { WalletInfoComponent } from './pages/wallet-info/wallet-info.component';
import { ModifyInfoComponent } from './pages/modify-info/modify-info.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MuzikaCommonModule,

    AppHomeRouteModule,

    MuzikaCoreModule,
    MatButtonModule,

    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot()
  ],
  declarations: [
    HomeLayoutComponent,
    WalletInfoComponent,
    ModifyInfoComponent,
  ],
  exports: [
  ]
})
export class HomeModule {

}
