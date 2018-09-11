import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PopupLayoutComponent } from './popup-layout.component';
import { WebPopupComponent } from './components/web/web-popup.component';

const routes: Routes = [
  { path: 'web', component: WebPopupComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild([
      // { path: 'popup', pathMatch: 'full', redirectTo: '/(popup:web)' },
      {
        path: '',
        outlet: 'popup',
        component: PopupLayoutComponent,
        children: [...routes]
      },
      // {
      //   path: 'web',
      //   pathMatch: 'full',
      //   outlet: 'popup',
      //   component: WebPopupComponent,
      // }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class PopupRouteModule {
}
