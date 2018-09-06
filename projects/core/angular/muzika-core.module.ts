import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ApplicationModule, Inject, NgModule, PLATFORM_ID } from '@angular/core';
import { BrowserTransferStateModule, TransferState } from '@angular/platform-browser';
import { environmentDev, environmentProd, environmentStage, EnvironmentType } from '@muzika/core';
import { PaginationComponent } from './components/pagination/pagination.component';
import { BASE_API_URL, EnvironmentToken, EnvironmentTypeToken } from './config/injection.tokens';
import { JWTInterceptor } from './config/jwt-interceptor';
import { ContractProviders } from './contracts/index';
import { FileBaseNamePipe, ObjectIteratorPipe } from './pipes';
import { StoreModule } from '@ngrx/store';

@NgModule({
  imports: [
    CommonModule,
    BrowserTransferStateModule,
    HttpClientModule,
    StoreModule
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
              private transferState: TransferState) {
  }
}
