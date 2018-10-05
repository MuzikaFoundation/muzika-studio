import {Component} from '@angular/core';
import {BaseComponent} from '@muzika/core/angular';
import {default as BigNumber} from 'bignumber.js';
import * as EthTx from 'ethereumjs-tx';
import * as ethUtil from 'ethereumjs-util';
import {WalletStorageService} from '../../services/wallet-storage.service';

@Component({
  selector: 'wallet-sign-transaction',
  templateUrl: './sign-transaction.component.html',
  styleUrls: ['./sign-transaction.component.scss']
})
export class WalletSignTransactionComponent extends BaseComponent {
  currentEvent: any;
  currentTx: any;

  constructor(private walletStorage: WalletStorageService) {
    super();
  }

  ngOnInit() {
    this._sub.push(
      this.walletStorage.eventSignTransaction.subscribe(event => {
        if (event) {
          this.currentEvent = event;
          this.currentTx = event.data;

          this.currentTx.value = this.hexToNumber(this.currentTx.value || 0);
          this.currentTx.gas = this.hexToNumber(this.currentTx.gas || this.currentTx.gasLimit);
          this.currentTx.gasPrice = this.hexToNumber(this.currentTx.gasPrice);
        } else {
          this.currentEvent = null;
          this.currentTx = null;
        }
      })
    );
  }

  sign() {
    try {
      this.currentTx.value = this.numberToHex(this.currentTx.value || 0);
      this.currentTx.gasPrice = this.numberToHex(this.currentTx.gasPrice);
      this.currentTx.gasLimit = this.numberToHex(this.currentTx.gasLimit || this.currentTx.gas || '0x00');
      this.currentTx.gas = this.numberToHex(this.currentTx.gas || this.currentTx.gasLimit || '0x00');

      this.currentTx.value = this.currentTx.value || '0x00';
      this.currentTx.data = ethUtil.addHexPrefix(this.currentTx.data);

      const privateKey = this.walletStorage.privateKeyOf({
        protocol: this.walletStorage.protocol,
        address: this.currentTx.from,
        password: this.walletStorage.currentWalletPassword
      });

      const tx = new EthTx(this.currentTx);
      tx.sign(privateKey);

      this.walletStorage.receiveSignTransactionEvent(
        Object.assign(this.currentEvent, {
          data: '0x' + tx.serialize().toString('hex')
        })
      );
    } catch (e) {
      this.walletStorage.receiveSignTransactionEvent(Object.assign(this.currentEvent, {error: e}));
    }
  }

  reject() {
    this.walletStorage.receiveSignTransactionEvent(
      Object.assign(this.currentEvent, {error: new Error('Rejected Request')})
    );
  }

  hexToNumber(value: string): string {
    return new BigNumber(value, 16).toString();
  }

  numberToHex(value: string): string {
    return '0x' + new BigNumber(value).toString(16);
  }
}
