import { Component, QueryList, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MuzikaConsole, promisify } from '@muzika/core';
import { BaseComponent, ExtendedWeb3, MuzikaWeb3Service, UserActions } from '@muzika/core/angular';
import {TabService} from '../../providers/tab.service';
import * as ethWallet from 'ethereumjs-wallet';
import * as ethUtil from 'ethereumjs-util';
import {WalletStorageService} from '../../modules/wallet/services/wallet-storage.service';

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

  @ViewChildren(NgForm)
  forms: QueryList<NgForm>;

  constructor(private userActions: UserActions,
              private walletStorage: WalletStorageService,
              private router: Router,
              private route: ActivatedRoute,
              private tabService: TabService,
              private web3Service: MuzikaWeb3Service,
              private web3: ExtendedWeb3) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    promisify(this.web3.eth.getAccounts).then(accounts => {
      this.accounts = accounts;
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
        this.tabService.changeTab('home');
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
    this.tabService.changeTab('wallet');
    this.router.navigate([{ outlets: { wallet: 'wallet-list' } }]);
  }
}
