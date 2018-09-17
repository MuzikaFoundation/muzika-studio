import {Component} from '@angular/core';
import {BaseComponent} from '@muzika/core/angular';
import { TabService } from '../../../../providers/tab.service';
import { Store } from '@ngrx/store';
import { AccountBalance, BlockChainProtocol, IAppState } from '@muzika/core';
import { combineLatest } from 'rxjs';
import { BlockChainClientProvider } from '../../../../providers/blockchain-client.provider';
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
  blockChain = <BlockChainProtocol>{
    protocol: null,
    network: null
  };

  constructor(
    private tabService: TabService,
    private popupService: PopupService,
    private store: Store<IAppState>,
    private router: Router,
    private bcClient: BlockChainClientProvider,
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
      this.accounts = accounts.map((account) => {
        return { name: account.name, address: account.address, balances: {} };
      });

      // load all accounts balances
      this.accounts.forEach(async (account, index) => {
        account.balances = await this.bcClient.balanceOf(account.address);
      });
    });
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
}
