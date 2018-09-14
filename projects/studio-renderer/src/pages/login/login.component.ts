import { Component, QueryList, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IAppState, MuzikaConsole, promisify } from '@muzika/core';
import { BaseComponent, ExtendedWeb3, MuzikaWeb3Service, UserActions } from '@muzika/core/angular';
import {TabService} from '../../providers/tab.service';
import {WalletStorageService} from '../../modules/wallet/services/wallet-storage.service';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { BlockChainClientProvider } from '../../providers/blockchain-client.provider';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-page-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginPageComponent extends BaseComponent {
  selectedAccount: string;
  accounts: string[];
  warningMessage = '';
  protocol: string;
  network: string;

  @ViewChildren(NgForm)
  forms: QueryList<NgForm>;

  constructor(
    private store: Store<IAppState>,
    private userActions: UserActions,
    private bcClient: BlockChainClientProvider,
    private walletStorage: WalletStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private tabService: TabService,
  ) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();

    // get block chain protocol and network from store.
    const protocol$ = this.store.select('app', 'protocol');
    const network$ = this.store.select('app', 'network');

    combineLatest(protocol$, network$)
      .subscribe(([protocol, network]) => {
        console.log(`protocol : ${protocol} / network : ${network}`);
        this.protocol = protocol;
        this.network = network;

        this._getWallets().then(() => {
          this.selectedAccount = '';
        });
      });
  }


  login() {
    if (this.selectedAccount === '' || this.selectedAccount === undefined || this.selectedAccount === null) {
      this.warningMessage = 'Please select account!';
      return;
    }

    // this.userActions.login('metamask').subscribe();
    this.userActions.login(this.selectedAccount).subscribe(
      user => {
        const redirectTo = this.route.snapshot.queryParams['redirectTo'] || '/home';
        this.router.navigateByUrl(redirectTo);
        this.tabService.changeTab('viewer');
      },
      error => {
        MuzikaConsole.error(error);
      }
    );
  }

  async createWallet() {
    const privateKey = this.bcClient.randomPrivateKey();
    this.bcClient.addWallet(privateKey);
    await this._getWallets();
    this.selectedAccount = this.accounts[this.accounts.length - 1];
  }

  goToWalletManager() {
    this.tabService.changeTab('popup');
    this.router.navigate([{ outlets: { popup: 'wallet-manager' } }]);
  }

  switchProtocol(protocol: 'eth' | 'ont') {
    this.bcClient.protocol = protocol;
  }

  switchNetwork(network: 'mainNet' | 'testNet') {
    this.bcClient.network = network;
  }

  private async _getWallets() {
    this.accounts = await this.bcClient.getWallets();
    return this.accounts;
  }
}
