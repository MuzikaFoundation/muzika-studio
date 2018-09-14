import { Injectable } from '@angular/core';
import { LocalStorage } from '@muzika/core/angular';
import { AlertifyInstnace } from '@muzika/core/browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Crypto, Account, Wallet } from 'ontology-ts-sdk';

const ONT_WALLET_KEY = 'ont-wallets';

@Injectable({providedIn: 'root'})
export class OntologyWalletStorageService {
  private _stateChange: BehaviorSubject<boolean> = new BehaviorSubject(false);

  // @TODO currently use localstorage
  constructor(
    private localStorage: LocalStorage
  ) {
  }

  get accounts(): string[] {
    const currentState: any[] = JSON.parse(this.localStorage.getItem(ONT_WALLET_KEY, '[]'));
    return currentState.map(state => state.accounts[0].address);
  }

  get walletsObs(): Observable<string[]> {
    return this._stateChange.asObservable().pipe(
      map(() => {
        return JSON.parse(this.localStorage.getItem(ONT_WALLET_KEY, '[]'));
      })
    );
  }

  addWallet(name: string, privateKey: Crypto.PrivateKey, password: string): void {
    const currentState: any[] = JSON.parse(this.localStorage.getItem(ONT_WALLET_KEY, '[]'));
    if (!currentState.map(state => state.name).includes(name)) {
      const wallet = Wallet.create(name);
      wallet.scrypt.n = 16384;

      const account = Account.create(privateKey, password, name, {
        cost: 16384,
        blockSize: 8,
        parallel: 8,
        size: 64
      });
      account.isDefault = true;

      wallet.addAccount(account);
      currentState.push(wallet.toJsonObj());
      this.localStorage.setItem('ont-wallets', JSON.stringify(currentState));
      this._stateChange.next(true);
    } else {
      AlertifyInstnace.alert('Name already exists in your wallets');
    }
  }

  hasWalletNameOf(name: string): boolean {
    const currentState: any[] = JSON.parse(this.localStorage.getItem(ONT_WALLET_KEY, '[]'));
    return currentState.map(state => state.name).includes(name);
  }
}

