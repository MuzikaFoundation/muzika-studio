import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PopupLayoutComponent } from './popup-layout.component';
import { WebPopupComponent } from './components/web/web-popup.component';
import { WalletManagerComponent } from './components/wallet-manager/wallet-manager.component';

const routes: Routes = [
  { path: 'web', component: WebPopupComponent },
  { path: 'wallet-manager', component: WalletManagerComponent },
];

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        outlet: 'popup',
        component: PopupLayoutComponent,
        children: [...routes]
      },
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class PopupRouteModule {
}
