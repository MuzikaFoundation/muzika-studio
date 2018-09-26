import {Component} from '@angular/core';
import {BaseComponent} from '@muzika/core/angular';
import * as sigUtil from 'eth-sig-util';
import * as ethUtil from 'ethereumjs-util';
import {UUIDEvent, WalletStorageService} from '../../services/wallet-storage.service';
import { BlockChainClient } from '../../../../providers/blockchain-client.service';
import { Store } from '@ngrx/store';
import { BlockChainProtocol, IAppState } from '@muzika/core';

@Component({
  selector: 'wallet-sign-personal-message',
  templateUrl: './sign-personal-message.component.html',
  styleUrls: ['./sign-personal-message.component.scss']
})
export class WalletSignPersonalMessageComponent extends BaseComponent {
  currentEvent: UUIDEvent;
  currentMsg: any;
  parsedCurrentMsg: string;
  blockChain: BlockChainProtocol;
  password: string;

  warningMessage = '';

  constructor(
    private walletStorage: WalletStorageService,
    private bcClient: BlockChainClient,
    private store: Store<IAppState>,
  ) {
    super();
  }

  ngOnInit() {
    this._sub.push(
      this.bcClient.blockChain.asObservable().subscribe(protocol => {
        this.blockChain = protocol;
      })
    );

    this._sub.push(
      this.walletStorage.eventSignMessage.subscribe(event => {
        if (event) {
          this.currentEvent = event;
          this.currentMsg = event.data;
          this.parsedCurrentMsg = ethUtil.toBuffer(this.currentMsg.data).toString();
        } else {
          this.currentEvent = null;
          this.currentMsg = null;
        }
      })
    );

    this._sub.push(
      this.store.select('app', 'currentWalletPassword').subscribe(password => this.password = password)
    );
  }

  sign() {
    try {
      const signObject = this.walletStorage.signMessage({
        protocol: this.bcClient.protocol,
        address: this.currentMsg.from,
        password: this.password,
        message: this.currentMsg.data
      });

      this.walletStorage.receiveSignMessageEvent(Object.assign(this.currentEvent, {data: signObject}));
    } catch (e) {
      this.warningMessage = 'Maybe password is not incorrect!';
      // this.walletStorage.receiveSignMessageEvent(Object.assign(this.currentEvent, {error: e}));
    }
  }

  reject() {
    this.walletStorage.receiveSignMessageEvent(
      Object.assign(this.currentEvent, {error: new Error('Rejected Request')})
    );
  }
}
