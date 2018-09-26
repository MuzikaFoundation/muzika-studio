import { Component, ElementRef, ViewChild } from '@angular/core';
import {BaseComponent} from '@muzika/core/angular';
import { TabService } from '../../../../providers/tab.service';
import { Store } from '@ngrx/store';
import { AccountBalance, BlockChainProtocol, IAppState } from '@muzika/core';
import { combineLatest } from 'rxjs';
import { BlockChainClient } from '../../../../providers/blockchain-client.service';
import { Router } from '@angular/router';
import { PopupService } from '../../../../providers/popup.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'wallet-list-page',
  templateUrl: './wallet-list.component.html',
  styleUrls: ['./wallet-list.component.scss']
})
export class WalletListComponent extends BaseComponent {
  accounts: {
    name: string;
    address: string;
    balances: AccountBalance,
  }[];
  selectedAccount: string;
  selectedName: string;
  blockChain = <BlockChainProtocol>{
    protocol: null,
    network: null
  };

  onDelete = false;
  delInputText: string;
  @ViewChild('delInput') delInput: ElementRef;

  txCall = {
    func: 'transfer',
    amountType: 'ETH'
  };

  constructor(
    private tabService: TabService,
    private popupService: PopupService,
    private store: Store<IAppState>,
    private router: Router,
    private bcClient: BlockChainClient,
  ) {
    super();
  }

  ngOnInit() {
    const protocol$ = this.store.select('app', 'protocol');
    const network$ = this.store.select('app', 'network');

    this._sub.push(
      combineLatest(protocol$, network$).subscribe(([protocol, network]) => {
        this.blockChain.protocol = protocol;
        this.blockChain.network = network;

        this.updateWalletList();
      })
    );

    // if tab is changed to `wallet`, refresh wallet list.
    this._sub.push(
      this.tabService.tabChange.pipe(
        filter((tab) => tab === 'wallet')
      ).subscribe(() => this.updateWalletList())
    );

    // if popup for wallet generate is closed, refresh wallet list.
    this._sub.push(
      this.popupService.popupClose$.pipe(
        filter(popup => popup === 'wallet-generate')
      ).subscribe(() => this.updateWalletList())
    );
  }

  updateWalletList() {
    this.bcClient.getWallets().then((accounts) => {
      const initialUpdate = !this.accounts;

      const newAccounts = accounts.map((account) => {
        return { name: account.name, address: account.address, balances: {} };
      });

      if (initialUpdate) {
        // When initialing updating wallet list, assign account list before balance
        // update for showing all wallets address more faster.
        this.accounts = newAccounts;
        // load all accounts balances
        this.accounts.forEach(async (account) => {
          account.balances = await this.bcClient.balanceOf(account.address);
        });
      } else {
        Promise.all(newAccounts.map(async (account, index) => {
          newAccounts[index].balances = await this.bcClient.balanceOf(account.address);
        })).then(() => this.accounts = newAccounts);
      }

    });
  }

  selectWallet(account: any) {
    this.selectedAccount = account.address;
    this.selectedName = account.name;
  }

  clickDeleteAccount() {
    this.onDelete = true;
    this.delInputText = '';
    setImmediate(() => this.delInput.nativeElement.focus());
  }

  /**
   * Deletes current account.
   */
  deleteAccount() {
    this.onDelete = false;
    this.bcClient.deleteWallet(this.selectedName);
    this.accounts = this.accounts.filter((account) => this.selectedName !== account.name);
    this.updateWalletList();
    this.selectedAccount = null;
    this.selectedName = null;
  }

  onDeletePopupKeyDown($event) {
    if ($event.key === 'Escape') {
      this.onDelete = false;
    }
  }

  goBack() {
    this.tabService.changeTab('viewer');
  }

  newWallet() {
    this.popupService.activate('wallet-generate', { queryParams: { genType: 'generate' } });
  }

  import() {
    this.popupService.activate('wallet-generate', { queryParams: { genType: 'import' } });
  }

  export() {
  }

  callTransaction() {

  }
}
