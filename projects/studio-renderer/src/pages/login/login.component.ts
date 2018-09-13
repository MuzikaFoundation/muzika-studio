import { Component, QueryList, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IAppState, MuzikaConsole, promisify } from '@muzika/core';
import { BaseComponent, ExtendedWeb3, MuzikaWeb3Service, UserActions } from '@muzika/core/angular';
import {TabService} from '../../providers/tab.service';
import * as ethWallet from 'ethereumjs-wallet';
import * as ethUtil from 'ethereumjs-util';
import {WalletStorageService} from '../../modules/wallet/services/wallet-storage.service';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-page-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginPageComponent extends BaseComponent {
  currentWalletProvider = 'private';
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
    private walletStorage: WalletStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private tabService: TabService,
    private web3Service: MuzikaWeb3Service,
    private web3: ExtendedWeb3
  ) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    promisify(this.web3.eth.getAccounts).then(accounts => {
      this.accounts = accounts;
    });

    // get block chain protocol and network from store.
    const protocol$ = this.store.select('app', 'protocol');
    const network$ = this.store.select('app', 'network');
    protocol$.pipe(take(1)).subscribe((protocol) => this.protocol = protocol);
    network$.pipe(take(1)).subscribe((network) => this.network = network);
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

  createWallet() {
    const wallet = ethWallet.generate();
    this.walletStorage.addWallet(ethUtil.bufferToHex(wallet.getPrivateKey()));
    promisify(this.web3.eth.getAccounts).then(accounts => {
      this.accounts = accounts;
      this.selectedAccount = this.accounts[this.accounts.length - 1];
    });
  }

  goToWalletManager() {
    this.tabService.changeTab('popup');
    this.router.navigate([{ outlets: { popup: 'wallet-manager' } }]);
  }

  switchProtocol(protocol: 'eth' | 'ont') {
    this.protocol = protocol;
  }

  switchNetwork(network: 'mainnet' | 'testnet') {
    this.network = network;
  }
}
