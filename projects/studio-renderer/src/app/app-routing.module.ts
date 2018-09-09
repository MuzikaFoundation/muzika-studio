import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginPageComponent } from '../pages/login/login.component';
import { UserSettingsComponent } from '../pages/settings/settings.component';
import { LoadingScreenComponent } from '../components/loading-screen/loading-screen.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'loading-screen', component: LoadingScreenComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'settings', component: UserSettingsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
