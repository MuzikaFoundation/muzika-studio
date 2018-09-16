import { Component } from '@angular/core';
import { BaseComponent } from '@muzika/core/angular';
import { ActivatedRoute } from '@angular/router';
import { BlockChainProtocol, IAppState } from '@muzika/core';
import { combineLatest } from 'rxjs';
import { Store } from '@ngrx/store';
import { BlockChainClientProvider } from '../../../../providers/blockchain-client.provider';
import { MuzikaTabs } from '../../../../providers/tab.service';
import { PopupService } from '../../../../providers/popup.service';


@Component({
  selector: 'wallet-generator',
  templateUrl: './wallet-generator.component.html',
  styleUrls: ['./wallet-generator.component.scss'],
})
export class WalletGeneratorComponent extends BaseComponent {
  prevTab: MuzikaTabs;
  genType: 'generate' | 'import' = 'generate';
  blockChain = <BlockChainProtocol>{
    protocol: 'eth',
    network: 'testNet'
  };

  showInvalid = false;

  ethWalletInfo = {
    name: '',
  };

  ethWalletImportForm = {
    name: '',
    privateKey: ''
  };

  ontWalletInfo = {
    name: '',
    password: ''
  };

  ontWalletImportForm = {
    name: '',
  };

  constructor(
   private route: ActivatedRoute,
   private store: Store<IAppState>,
   private bcClient: BlockChainClientProvider,
   private popupService: PopupService,
  ) {
    super();

    const protocol$ = this.store.select('app', 'protocol');
    const network$ = this.store.select('app', 'network');

    this._sub.push(
      combineLatest(protocol$, network$).subscribe(([protocol, network]) => {
        this.blockChain.protocol = protocol;
        this.blockChain.network = network;
      })
    );
  }

  ngOnInit() {
    this._sub.push(
      this.route.queryParams.subscribe((params) => {
        this.changeType(params.genType);
        this.prevTab = params.prevTab || 'viewer';
      })
    );
  }

  changeType(genType: 'generate' | 'import') {
    this.genType = genType;
  }

  generateWallet() {
    this.showInvalid = true;

    if (!this.checkValidation()) {
      return;
    }

    if (this.genType === 'generate') {
      const privateKey = this.bcClient.randomPrivateKey();

      if (this.blockChain.protocol === 'eth') {
        this.bcClient.addWallet(this.ethWalletInfo.name, privateKey);
      } else if (this.blockChain.protocol === 'ont') {
        this.bcClient.addWallet(this.ontWalletInfo.name, privateKey, this.ontWalletInfo.password);
      }
    } else {
      if (this.blockChain.protocol === 'eth') {
        this.bcClient.addWallet(this.ethWalletImportForm.name, this.ethWalletImportForm.privateKey);
      }
    }

    this.popupService.deactivate();
  }

  checkValidation() {
    switch (this.genType) {
      case 'generate':
        if (this.blockChain.protocol === 'eth') {
          if (!this.ethWalletInfo.name) {
            return false;
          }
        } else if (this.blockChain.protocol === 'ont') {
          if (!this.ontWalletInfo.name || !this.ontWalletInfo.password) {
            return false;
          }
        }

        return true;

      case 'import':
        if (this.blockChain.protocol === 'eth') {
          if (!this.ethWalletImportForm.name && !this.ethWalletImportForm.privateKey) {
            return false;
          }
        } else if (this.blockChain.protocol === 'ont') {
          if (!this.ontWalletImportForm.name) {
            return false;
          }
        }
    }

    return true;
  }
}
