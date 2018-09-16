import {Injectable} from '@angular/core';
import {LocalStorage} from '@muzika/core/angular';
import {AlertifyInstnace} from '@muzika/core/browser';
import * as ethUtil from 'ethereumjs-util';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import * as serializeError from 'serialize-error';

export interface EthWalletInfo {
  name: string;
  privateKey: string;
}

@Injectable({providedIn: 'root'})
export class WalletStorageService {
  private _stateChange: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _eventSignPersonalMessage: BehaviorSubject<UUIDEvent> = new BehaviorSubject(null);

  // @TODO currently use localstorage
  constructor(private localStorage: LocalStorage) {
  }

  private _eventSignTransaction: BehaviorSubject<UUIDEvent> = new BehaviorSubject(null);

  get eventSignTransaction(): Observable<UUIDEvent> {
    return this._eventSignTransaction.asObservable();
  }

  get accounts(): any[] {
    const currentState: EthWalletInfo[] = JSON.parse(this.localStorage.getItem('eth-wallets', '[]'));

    return currentState.map(state => {
      const key = state.privateKey;
      const address = ethUtil.privateToAddress(ethUtil.toBuffer(key));

      return { name: state.name, address: ethUtil.toChecksumAddress(ethUtil.bufferToHex(address)) };
    });
  }

  get walletsObs(): Observable<string[]> {
    return this._stateChange.asObservable().pipe(
      map(() => {
        return JSON.parse(this.localStorage.getItem('eth-wallets', '[]'));
      })
    );
  }

  get eventSignMessage(): Observable<UUIDEvent> {
    return this._eventSignPersonalMessage.asObservable();
  }

  addWallet(name: string, privateKey: string): void {
    const currentState: EthWalletInfo[] = JSON.parse(this.localStorage.getItem('eth-wallets', '[]'));

    privateKey = ethUtil.addHexPrefix(privateKey);
    if (ethUtil.isValidPrivate(ethUtil.toBuffer(privateKey))) {
      // if wallet name does not exist, add it
      if (currentState.findIndex((state) => (state.name === name)) === -1) {
        currentState.push(<EthWalletInfo>{ name, privateKey });
        this.localStorage.setItem('eth-wallets', JSON.stringify(currentState));
      } else {
        // if wallet name already exists, alert error
        AlertifyInstnace.alert('Already exists in your wallets');
      }
    } else {
      // if invalid private key format
      AlertifyInstnace.alert('Invalid Private key');
    }
  }

  hasPrivateKeyOf(address: string): boolean {
    const currentState: EthWalletInfo[] = JSON.parse(this.localStorage.getItem('eth-wallets', '[]'));

    return currentState.findIndex(state => {
      const key = state.privateKey;
      return ethUtil.bufferToHex(ethUtil.privateToAddress(ethUtil.toBuffer(key))) === address.toLowerCase();
    }) !== -1;
  }

  privateKeyOf(address: string): Buffer {
    const currentState: EthWalletInfo[] = JSON.parse(this.localStorage.getItem('eth-wallets', '[]'));

    const filter = currentState.filter(state => {
      const key = state.privateKey;
      return ethUtil.bufferToHex(ethUtil.privateToAddress(ethUtil.toBuffer(key))) === address.toLowerCase();
    });

    if (filter.length === 0) {
      throw new Error(`Unknown address - unable to sign message for this address: "${address}"`);
    } else {
      return ethUtil.toBuffer(filter[0].privateKey);
    }
  }

  emitSignMessageEvent(event: UUIDEvent) {
    const previous = this._eventSignPersonalMessage.value;
    if (previous !== null) {
      this.receiveSignMessageEvent({
        event: previous.event,
        uuid: previous.uuid,
        error: new Error('Rejected request')
      });
    }
    this._eventSignPersonalMessage.next(event);
  }

  receiveSignMessageEvent(event: UUIDEvent) {
    this._eventSignPersonalMessage.next(null);

    if (event.error) {
      event.event.sender.send('WalletProvider:signPersonalMessage', event.uuid, serializeError(event.error));
    } else {
      event.event.sender.send('WalletProvider:signPersonalMessage', event.uuid, null, event.data);
    }
  }

  emitSignTransactionEvent(event: UUIDEvent) {
    const previous = this._eventSignTransaction.value;
    if (previous !== null) {
      this.receiveSignTransactionEvent({
        event: previous.event,
        uuid: previous.uuid,
        error: new Error('Rejected request')
      });
    }
    this._eventSignTransaction.next(event);
  }

  receiveSignTransactionEvent(event: UUIDEvent) {
    this._eventSignTransaction.next(null);

    if (event.error) {
      event.event.sender.send('WalletProvider:signTransaction', event.uuid, serializeError(event.error));
    } else {
      event.event.sender.send('WalletProvider:signTransaction', event.uuid, null, event.data);
    }
  }
}

export interface UUIDEvent {
  event: any;
  uuid: string;
  data?: any;
  error?: any;
}
