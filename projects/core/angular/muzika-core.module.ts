import { NgRedux, NgReduxModule } from '@angular-redux/store';
import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ApplicationModule, Inject, NgModule, PLATFORM_ID } from '@angular/core';
import { BrowserTransferStateModule, TransferState } from '@angular/platform-browser';
import { environmentDev, environmentProd, environmentStage, EnvironmentType, IAppState, rootReducer } from '@muzika/core';
import { createStore } from 'redux';
import { PaginationComponent } from './components/pagination/pagination.component';
import { BASE_API_URL, EnvironmentToken, EnvironmentTypeToken, MUZIKA_REDUX_STATE_KEY } from './config/injection.tokens';
import { JWTInterceptor } from './config/jwt-interceptor';
import { ContractProviders } from './contracts/index';
import {FileBaseNamePipe, ObjectIteratorPipe} from './pipes';

@NgModule({
  imports: [
    CommonModule,
    BrowserTransferStateModule,
    HttpClientModule,
    NgReduxModule
  ],
  declarations: [
    PaginationComponent,
    FileBaseNamePipe,
    ObjectIteratorPipe
  ],
  exports: [
    CommonModule,
    ApplicationModule,
    PaginationComponent,
    FileBaseNamePipe,
    ObjectIteratorPipe
  ],
  providers: [
    ...ContractProviders,

    {
      provide: HTTP_INTERCEPTORS,
      useClass: JWTInterceptor,
      multi: true
    },
    {
      provide: EnvironmentToken,
      useFactory: (environmentType: string) => {
        return {
          dev: environmentDev,
          stage: environmentStage,
          prod: environmentProd
        }[environmentType] || environmentDev;
      },
      deps: [[EnvironmentTypeToken]]
    },
    {
      provide: 'RPC_URL',
      useFactory: (environment: EnvironmentType) => {
        return `${environment.rpcUrl}/${environment.infuraAccessToken}`;
      },
      deps: [[EnvironmentToken]]
    },
    {
      provide: BASE_API_URL,
      useFactory: (environment: EnvironmentType) => {
        return environment.base_api_url;
      },
      deps: [[EnvironmentToken]]
    }
  ]
})
export class MuzikaCoreModule {
  constructor(@Inject(PLATFORM_ID) private platformId: string,
              private transferState: TransferState,
              private ngRedux: NgRedux<IAppState>) {

    // if (isPlatformServer(this.platformId)) { // In Server
    //   this.ngRedux.provideStore(createStore(rootReducer));
    //   if (!this.transferState.hasKey(MUZIKA_REDUX_STATE_KEY)) {
    //     this.transferState.onSerialize(MUZIKA_REDUX_STATE_KEY, () => this.ngRedux.getState());
    //   }
    // }
    //
    // if (isPlatformBrowser(this.platformId)) {
    //   const state = this.transferState.get<any>(MUZIKA_REDUX_STATE_KEY, null);
    //   if (state) { // Server side rendering을 통해 REDUX_STATE_KEY를 받아온 경우
    //     this.ngRedux.configureStore(rootReducer, state);
    //   } else {
    //     this.ngRedux.provideStore(createStore(rootReducer));
    //   }
    // }
  }
}
