import { WalletHomeComponent } from './pages/home/home.component';
import { RouterModule, Routes } from '@angular/router';
import { WalletSignPersonalMessageComponent } from './pages/sign-personal-message/sign-personal-message.component';
import { WalletSignTransactionComponent } from './pages/sign-transaction/sign-transaction.component';
import { WalletListComponent } from './pages/wallet-list/wallet-list.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  { path: 'wallet-list', component: WalletListComponent },
  { path: 'sign-message', component: WalletSignPersonalMessageComponent },
  { path: 'sign-transaction', component: WalletSignTransactionComponent },
  // { path: '**', component: WalletHomeComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', pathMatch: 'full', redirectTo: '/(wallet:wallet-list)' },
      {
        path: '',
        outlet: 'wallet',
        component: WalletHomeComponent,
        children: [...routes]
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class WalletRoutesModule {
}
