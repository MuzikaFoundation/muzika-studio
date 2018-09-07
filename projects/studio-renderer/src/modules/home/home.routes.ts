import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeLayoutComponent} from './layout/home-layout.component';
import {WalletInfoComponent} from './pages/wallet-info/wallet-info.component';

const routes: Routes = [{
  path: 'home',
  component: HomeLayoutComponent,
  children: [
    { path: '', component: WalletInfoComponent },
  ]
}];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppHomeRouteModule {
}
