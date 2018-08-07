import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent, ExtendedWeb3, UserActions } from '@muzika/core/angular';
import { TranslateService } from '@ngx-translate/core';
import {interval, timer} from 'rxjs';
import { environment } from '../environments/environment';
import { ElectronService } from '../providers/electron.service';
import { MuzikaWalletProvider } from '../providers/muzika-wallet.provider';
import { MuzikaTabs, TabService } from '../providers/tab.service';
import { MuzikaConsole } from '@muzika/core';
import {NgRedux} from '@angular-redux/store';
import {IAppState, rootReducer} from '@muzika/core/electron';
import {applyMiddleware, createStore} from 'redux';
import { remote } from 'electron';
import { forwardToMain, replayActionRenderer } from 'electron-redux';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends BaseComponent implements AfterViewInit {
  currentTab: MuzikaTabs = 'viewer';

  constructor(public electronService: ElectronService,
              @Inject(PLATFORM_ID) private platformId: any,
              private userActions: UserActions,
              private zone: NgZone,
              private translate: TranslateService,
              private web3: ExtendedWeb3,
              private tabService: TabService,
              private router: Router,
              private ngRedux: NgRedux<IAppState>,
              private walletProvider: MuzikaWalletProvider) {
    super();
    translate.setDefaultLang('en');
    MuzikaConsole.log('AppConfig', environment);

    if (electronService.isElectron()) {
      MuzikaConsole.log('Mode electron');
      MuzikaConsole.log('Electron ipcRenderer', electronService.ipcRenderer);
      MuzikaConsole.log('NodeJS childProcess', electronService.childProcess);
    } else {
      MuzikaConsole.log('Mode web');
    }
  }

  ngOnInit() {
    super.ngOnInit();

    if (isPlatformBrowser(this.platformId)) {
      // Angular Zone Change Detection Wait 문제 해결
      this.zone.runOutsideAngular(() => {
        this._sub.push(
          interval(30000)
            .subscribe(() => {
              this.zone.run(() => this.userActions.refreshMe().subscribe());
            })
        );
        this.userActions.refreshMe().subscribe();
      });
    }

    this._sub.push(
      this.tabService.tabChange.subscribe(tab => {
        this.currentTab = tab;
      })
    );
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.web3.setProvider(this.walletProvider);
    }
  }

  closeFloating() {
    this.tabService.changeTab('viewer');
  }
}
