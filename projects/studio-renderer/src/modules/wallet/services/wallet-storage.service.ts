import { Injectable } from '@angular/core';
import { LocalStorage } from '@muzika/core/angular';
import * as ethUtil from 'ethereumjs-util';
import * as ethWallet from 'ethereumjs-wallet-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as serializeError from 'serialize-error';
import { IAppState, EthereumWalletItem, OntologyWalletItem, WalletInfo, ProtocolType, NetworkType } from '@muzika/core';
import { Signature } from 'ontology-dapi';
import { Store } from '@ngrx/store';
import { Crypto, Wallet, Account, utils } from 'ontology-ts-sdk';
import { IPCUtil } from '../../../util/ipc-utils';
import { ElectronService } from '../../../providers/electron.service';
import * as sigUtil from 'eth-sig-util';
const debug = require('debug')('muzika:renderer:wallet-storage');


/**
 * local storage key for wallets of Ethereum and Ontology.
 */
export const ETH_WALLET_STORAGE_KEY = 'eth-wallets';
export const ONT_WALLET_STORAGE_KEY = 'ont-wallets';


/**
 * This service class manages the wallet on Ethereum and Ontology protocol with the same
 * (or similar if it cannot be same) interface.
 *
 * All wallets are named and all private keys in wallets are encrypted with `scrypt` algorithm.
 * On Ethereum, it uses V3 wallet format and on ontology, it uses default wallet format.
 */
@Injectable({providedIn: 'root'})
export class WalletStorageService {
  protocol: ProtocolType;
  currentWallet: EthereumWalletItem | OntologyWalletItem;
  currentWalletPassword: string;

  private _stateChange: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _eventSignPersonalMessage: BehaviorSubject<UUIDEvent> = new BehaviorSubject(null);

  // @TODO currently use localstorage
  constructor(
    private store: Store<IAppState>,
    private localStorage: LocalStorage,
    private electronService: ElectronService,
  ) {
    this.store.select('app', 'protocol').subscribe(protocol => this.protocol = protocol);
    this.store.select('app', 'currentWallet').subscribe(wallet => this.currentWallet = wallet);
    this.store.select('app', 'currentWalletPassword').subscribe(password => this.currentWalletPassword = password);
  }

  private _eventSignTransaction: BehaviorSubject<UUIDEvent> = new BehaviorSubject(null);

  get eventSignTransaction(): Observable<UUIDEvent> {
    return this._eventSignTransaction.asObservable();
  }

  get accounts(): WalletInfo[] {
    switch (this.protocol) {
      case 'eth':
        const currentEthState: EthereumWalletItem[] = JSON.parse(this.localStorage.getItem(ETH_WALLET_STORAGE_KEY, '[]'));

        return currentEthState.map(state => {
          return <WalletInfo>{ name: state.name, address: ethUtil.addHexPrefix(state.wallet.address) };
        });

      case 'ont':
        const currentOntState: OntologyWalletItem[] = JSON.parse(this.localStorage.getItem(ONT_WALLET_STORAGE_KEY, '[]'));

        return currentOntState.map(state => {
          // Currently, only the first accounts in wallet file can be used.
          return <WalletInfo>{ name: state.name, address: state.accounts[0].address };
        });
    }
  }

  get walletsObs(): Observable<EthereumWalletItem[] | OntologyWalletItem[]> {
    const key = (this.protocol === 'eth') ? ETH_WALLET_STORAGE_KEY : (this.protocol === 'ont') ? ONT_WALLET_STORAGE_KEY : null;
    return this._stateChange.asObservable().pipe(
      map(() => {
        return JSON.parse(this.localStorage.getItem(key, '[]'));
      })
    );
  }

  get eventSignMessage(): Observable<UUIDEvent> {
    return this._eventSignPersonalMessage.asObservable();
  }

  async addWallet(protocol: 'eth' | 'ont', name: string, privateKey: string, password?: string): Promise<void> {
    const currentState = this.getCurrentState(protocol);
    if (this.hasNameOf(protocol, name)) {
      return Promise.reject(new Error(`Wallet name already exists on ${(protocol === 'eth') ? 'ethereum' : 'ontology'} protocol`));
    }

    return new Promise<void>((resolve) => {
      const uuid = IPCUtil.uuid();
      this.electronService.ipcRenderer.once(IPCUtil.wrap('Wallet:generate', uuid), (events, error, wallet) => {
        debug(`Wallet generated ${wallet}`);
        currentState.push(wallet);
        this.saveState(protocol, currentState);
        resolve();
      });
      debug(`Request wallet generate (name: ${name}, privateKey: ${privateKey}, password: ${password})`);
      this.electronService.ipcRenderer.send('Wallet:generate', uuid, protocol, name, privateKey, password);
    });

  }

  deleteWallet(protocol: 'eth' | 'ont', name: string): void {
    const currentState = this.getCurrentState(protocol);
    const index = this.nameIndexOf(protocol, name, currentState);

    if (index === -1) {
      throw new Error('cannot find wallet');
    } else {
      currentState.splice(index, 1);
      this.localStorage.setItem(this.getWalletStorageKey(protocol), JSON.stringify(currentState));
    }
  }

  hasAddressOf(protocol: 'eth' | 'ont', address: string, state?: any[]): boolean {
    return this.addressIndexOf(protocol, address, state) !== -1;
  }

  addressOf(protocol: 'eth' | 'ont', address: string, state?: any[]): EthereumWalletItem | OntologyWalletItem {
    const currentState = (state) ? state : this.getCurrentState(protocol);
    const index = this.addressIndexOf(protocol, address, currentState);
    return (index === -1) ? null : currentState[index];
  }

  addressIndexOf(protocol: 'eth' | 'ont', address: string, state?: any[]): number {
    const currentState = (state) ? state : this.getCurrentState(protocol);
    address = ((address.slice(0, 2) === '0x') ? address.slice(2) : address).toLowerCase();
    return currentState.findIndex(_state => {
      if (protocol === 'eth') {
        return _state.wallet.address === address;
      } else if (protocol === 'ont') {
        return _state.accounts[0].address === address;
      }
    });
  }

  /**
   * Returns whether the named wallet exists.
   *
   * @param protocol blockchain protocol.
   * @param name wallet name.
   * @param state wallet storage value.
   */
  hasNameOf(protocol: 'eth' | 'ont', name: string, state?: any[]): boolean {
    return this.nameIndexOf(protocol, name, state) !== -1;
  }

  /**
   * Returns the wallet by name.
   *
   * @param protocol blockchain protocol.
   * @param name wallet name.
   * @param state wallet storage value.
   */
  nameOf(protocol: 'eth' | 'ont', name: string, state?: any[]): EthereumWalletItem | OntologyWalletItem {
    const currentState = (state) ? state : this.getCurrentState(protocol);
    const index = currentState.findIndex(_state => _state.name === name);
    return (index === -1) ? null : currentState[index];
  }

  /**
   * Returns the index of the wallet in storage.
   *
   * @param protocol blockchain protocol.
   * @param name wallet name.
   * @param state wallet storage value.
   */
  nameIndexOf(protocol: 'eth' | 'ont', name: string, state?: any[]): number {
    const currentState = (state) ? state : this.getCurrentState(protocol);
    return currentState.findIndex(_state => _state.name === name);
  }

  /**
   * Gets the private key of certain named wallet with password. `name` or
   * `address`should be passed for getting private key.
   *
   * @param protocol blockchain protocol.
   * @param name wallet name.
   * @param address wallet address.
   * @param password wallet password
   */
  async privateKeyOf({ protocol, name, address, password }: {
    protocol: ProtocolType,
    name?: string,
    address?: string,
    password: string
  }): Promise<Buffer | Crypto.PrivateKey> {
    const keystore = (name) ? this.nameOf(protocol, name) : this.addressOf(protocol, address);

    return new Promise<any>((resolve) => {
      const uuid = IPCUtil.uuid();
      this.electronService.ipcRenderer.once(IPCUtil.wrap('Wallet:decrypt', uuid), (events, error, privateKey) => {
        if (protocol === 'ont') {
          privateKey = Crypto.PrivateKey.deserializeWIF(privateKey);
        }
        resolve(privateKey);
      });
      this.electronService.ipcRenderer.send('Wallet:decrypt', uuid, protocol, keystore, password);
    });
  }

  /**
   * Signs a message with an address and return the serialized signed message.
   * Either `name` or `address` should be passed for signing.
   *
   * @param protocol blockchain protocol.
   * @param name wallet name.
   * @param address wallet address.
   * @param password wallet password.
   * @param message message for signing.
   */
  async signMessage({ protocol, name, address, password, message }: {
    protocol: ProtocolType,
    name?: string,
    address?: string,
    password: string,
    message: string
  }): Promise<string | Signature> {
    const privateKey = await this.privateKeyOf({ protocol, name, address, password });
    switch (protocol) {
      case 'eth':
        return sigUtil.personalSign(privateKey, { data: message });
      case 'ont':
        // sign the message hash (by sha256) using ECDSA.
        const publicKey = (privateKey as Crypto.PrivateKey).getPublicKey().serializeHex();
        const data = (privateKey as Crypto.PrivateKey).sign(
          utils.str2hexstr(message), Crypto.SignatureScheme.ECDSAwithSHA3_256
        ).serializeHex();
        return { publicKey, data };
    }

    throw new Error('Unsupported blockchain protocol');
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

  getAccounts(protocol: string): WalletInfo[] {
    const currentState = this.getCurrentState(protocol);
    switch (protocol) {
      case 'eth':
        return currentState.map((state) => <WalletInfo>{ name: state.name, address: ethUtil.addHexPrefix(state.wallet.address) });
      case 'ont':
        return currentState.map((state) => <WalletInfo>{ name: state.name, address: state.accounts[0].address });
    }
  }

  saveState(protocol: string, state: any[]): void {
    this.localStorage.setItem(this.getWalletStorageKey(protocol), JSON.stringify(state));
  }

  getCurrentState(protocol: string): any[] {
    return JSON.parse(this.localStorage.getItem(this.getWalletStorageKey(protocol), '[]'));
  }

  // noinspection JSMethodCanBeStatic
  getWalletStorageKey(protocol: string) {
    switch (protocol) {
      case 'eth':
        return ETH_WALLET_STORAGE_KEY;
      case 'ont':
        return ONT_WALLET_STORAGE_KEY;
    }
    throw new Error('Unsupported blockchain protocol');
  }
}

export interface UUIDEvent {
  event: any;
  uuid: string;
  data?: any;
  error?: any;
}
