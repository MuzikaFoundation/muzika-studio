import { Component, QueryList, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockChainProtocol, IAppState, MuzikaConsole } from '@muzika/core';
import { BaseComponent, UserActions } from '@muzika/core/angular';
import {TabService} from '../../providers/tab.service';
import {WalletStorageService} from '../../modules/wallet/services/wallet-storage.service';
import { Store } from '@ngrx/store';
import { BlockChainClient } from '../../providers/blockchain-client.service';
import { combineLatest } from 'rxjs';
import { PopupService } from '../../providers/popup.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-page-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginPageComponent extends BaseComponent {
  selectedAccount: string;
  selectedAccountName: string;
  selectedPassword: string;
  accounts: string[];
  warningMessage = '';
  blockChain: BlockChainProtocol = {
    protocol: 'eth',
    network: 'testNet'
  };

  @ViewChildren(NgForm)
  forms: QueryList<NgForm>;

  constructor(
    private store: Store<IAppState>,
    private userActions: UserActions,
    private bcClient: BlockChainClient,
    private walletStorage: WalletStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private tabService: TabService,
    private popupService: PopupService,
  ) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();

    // get block chain protocol and network from store.
    const protocol$ = this.store.select('app', 'protocol');
    const network$ = this.store.select('app', 'network');

    this._sub.push(
      combineLatest(protocol$, network$)
        .subscribe(([protocol, network]) => {
          this.blockChain.protocol = protocol;
          this.blockChain.network = network;

          this._getWallets().then(() => {
            this.selectedAccount = '';
            this.selectedPassword = '';
          });
        })
    );

    // When tab changed or event occurs or popup is closed, update wallet list since
    // wallet list component in wallet tab or wallet-create popup would change the
    // wallet storage.
    this._sub.push(
      combineLatest(
        this.tabService.tabChange,
        this.popupService.popupClose$.pipe(filter(popup => popup === 'wallet-generate'))
      ).subscribe(() => this._getWallets())
    );
  }


  login() {
    if (this.selectedAccount === '' || this.selectedAccount === undefined || this.selectedAccount === null) {
      this.warningMessage = 'Please select account!';
      return;
    }

    // this.userActions.login('metamask').subscribe();
    this.bcClient.account = this.selectedAccount;
    this.bcClient.password = this.selectedPassword;
    this.userActions.login(this.blockChain.protocol, this.selectedAccount).subscribe(
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
    this.popupService.activate('wallet-generate',  { queryParams: { genType: 'generate' } });
  }

  goToWalletManager() {
    this.router.navigate([{ outlets: { wallet: 'wallet-list' } }]);
    this.tabService.changeTab('wallet');
  }

  selectAccount(account: string) {
    this.selectedAccount = account;
  }

  switchProtocol(protocol: 'eth' | 'ont') {
    this.bcClient.protocol = protocol;

    this.warningMessage = '';
  }

  switchNetwork(network: 'mainNet' | 'testNet') {
    this.bcClient.network = network;
  }

  private async _getWallets() {
    this.accounts = await this.bcClient.getWallets();
    return this.accounts;
  }
}
