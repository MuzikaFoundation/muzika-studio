import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeLayoutComponent} from './layout/home-layout.component';
import {WalletInfoComponent} from './pages/wallet-info/wallet-info.component';
import { ModifyInfoComponent } from './pages/modify-info/modify-info.component';

const routes: Routes = [{
  path: 'home',
  component: HomeLayoutComponent,
  children: [
    { path: '', component: WalletInfoComponent },
    { path: 'modify', component: ModifyInfoComponent }
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
