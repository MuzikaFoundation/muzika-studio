import { Component } from '@angular/core';
import { BaseComponent } from '@muzika/core/angular';
import { ActivatedRoute } from '@angular/router';
import { BlockChainProtocol, IAppState } from '@muzika/core';
import { combineLatest } from 'rxjs';
import { Store } from '@ngrx/store';
import { BlockChainClient } from '../../../../providers/blockchain-client.service';
import { MuzikaTabs } from '../../../../providers/tab.service';
import { PopupService } from '../../../../providers/popup.service';
const debug = require('debug')('muzika:renderer:wallet-generator');


@Component({
  selector: 'wallet-generator',
  templateUrl: './wallet-generator.component.html',
  styleUrls: ['./wallet-generator.component.scss'],
})
export class WalletGeneratorComponent extends BaseComponent {
  prevTab: MuzikaTabs;
  genType: 'generate' | 'import' | '' = '';
  blockChain = <BlockChainProtocol>{
    protocol: 'eth',
    network: 'testNet'
  };

  showInvalid = false;
  warningMessage = '';

  walletGenInputs = {
    name: '',
    password: ''
  };

  ethWalletImportForm = {
    name: '',
    privateKey: ''
  };

  ontWalletImportForm = {
    name: '',
  };

  constructor(
   private route: ActivatedRoute,
   private store: Store<IAppState>,
   private bcClient: BlockChainClient,
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
    this._generateWallet()
      .then(() => debug('generate wallet success!'))
      .catch((err) => this.warningMessage = err.message);
  }

  checkValidation() {
    switch (this.genType) {
      case 'generate':
        return !(!this.walletGenInputs.name || !this.walletGenInputs.password);

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

  private async _generateWallet() {
    // if input form is not fulfilled, don't try to generate and show unfulfilled inputs.
    this.showInvalid = true;
    if (!this.checkValidation()) {
      return;
    }

    if (this.genType === 'generate') {
      const privateKey = this.bcClient.randomPrivateKey();
      await this.bcClient.addWallet(this.walletGenInputs.name, privateKey, this.walletGenInputs.password);
    } else {
      if (this.blockChain.protocol === 'eth') {
        await this.bcClient.addWallet(this.ethWalletImportForm.name, this.ethWalletImportForm.privateKey);
      }
    }

    this.popupService.deactivate();
  }
}
