import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent, ExtendedWeb3, UserActions } from '@muzika/core/angular';
import { TranslateService } from '@ngx-translate/core';
import { interval } from 'rxjs';
import { environment } from '../environments/environment';
import { ElectronService } from '../providers/electron.service';
import { MuzikaWalletProvider } from '../providers/muzika-wallet.provider';
import { MuzikaTabs, TabService } from '../providers/tab.service';
import { MuzikaConsole } from '@muzika/core';
import { RenderOptions } from '@muzika/core/electron';
import { forwardToMain, replayActionRenderer } from 'electron-redux';
import { remote } from 'electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends BaseComponent implements AfterViewInit {
  currentTab: MuzikaTabs = 'viewer';
  renderOptions: RenderOptions;

  constructor(public electronService: ElectronService,
              @Inject(PLATFORM_ID) private platformId: any,
              private userActions: UserActions,
              private zone: NgZone,
              private translate: TranslateService,
              private web3: ExtendedWeb3,
              private tabService: TabService,
              private router: Router,
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
    this.renderOptions = (<any>remote.getCurrentWindow()).renderOptions;

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

    // when this option is false, let the current electron BrowserWindow instance
    // call `show()` function, so user sees the completely rendered windows.
    if (!this.renderOptions.disableShowAfterInitView) {
      remote.getCurrentWindow().show();
    }
  }

  closeFloating() {
    this.tabService.changeTab('viewer');
  }
}
