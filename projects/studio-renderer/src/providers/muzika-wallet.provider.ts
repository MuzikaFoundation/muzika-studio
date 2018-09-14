import {Provider as Web3Provider, TxData} from '@0xproject/types';
import {Inject, Injectable, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import * as ProviderEngine from 'web3-provider-engine';
import * as RpcSubprovider from 'web3-provider-engine/subproviders/rpc';
import * as HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet';
import * as FiltersSubprovider from 'web3-provider-engine/subproviders/filters';
import {IPCUtil} from '../util/ipc-utils';
import {TabService} from './tab.service';
import {ElectronService} from './electron.service';
import * as deserializeError from 'deserialize-error';

@Injectable({providedIn: 'root'})
export class MuzikaWalletProvider implements Web3Provider {
  private readonly engine: ProviderEngine;
  private readonly _rpcProvider: RpcSubprovider;

  constructor(@Inject('RPC_URL') private _rpcUrl: string,
              private electronService: ElectronService,
              private tabService: TabService,
              private zone: NgZone,
              private router: Router) {
    this._rpcProvider = new RpcSubprovider({ rpcUrl: _rpcUrl });

    const opts = {
      getAccounts: (cb: (error, ...args) => any) => {
        this.zone.run(() => {
          this.getAccounts(cb);
        });
      },
      signTransaction: (txData: TxData, cb: (error, ...args) => any) => {
        this.zone.run(() => {
          this.tabService.changeTab('floating-wallet');
          this.router.navigate([{outlets: {wallet: 'sign-transaction'}}]);
          this.signTransaction(txData, cb);
        });
      },
      signPersonalMessage: (msgParams: any, cb: (error, ...args) => any) => {
        this.zone.run(() => {
          this.tabService.changeTab('floating-wallet');
          this.router.navigate([{outlets: {wallet: 'sign-message'}}]);
          this.signPersonalMessage(msgParams, cb);
        });
      }
    };

    this.engine = new ProviderEngine({pollingInterval: 10000});
    this.engine.addProvider(new FiltersSubprovider());
    this.engine.addProvider(new HookedWalletSubprovider(opts));
    this.engine.addProvider(this._rpcProvider);
    this.engine.start(); // Required by the provider engine.
  }

  sendAsync(...args) {
    this.engine.sendAsync.apply(this.engine, args);
  }

  send(...args): any {
    return this.engine.send.apply(this.engine, args);
  }

  stop(): void {
    this.engine.stop();
  }

  private getAccounts(cb: (error, ...args) => any): void {
    const uuid = IPCUtil.uuid();
    this.electronService.ipcRenderer.once(IPCUtil.wrap('Wallet:getAccounts', uuid), (events, error, accounts) => {
      if (error) {
        cb(deserializeError(error));
      } else {
        cb(null, accounts);
      }
    });
    this.electronService.ipcRenderer.send('Wallet:getAccounts', uuid);
  }

  private signTransaction(txData: TxData, cb: (error, ...args) => any): void {
    const uuid = IPCUtil.uuid();
    this.electronService.ipcRenderer.once(IPCUtil.wrap('Wallet:signTransaction', uuid), (events, error, signed) => {
      this.tabService.changeTab('viewer');
      if (error) {
        cb(deserializeError(error));
      } else {
        cb(null, signed);
      }
    });
    this.electronService.ipcRenderer.send('Wallet:signTransaction', uuid, txData);
  }

  private signPersonalMessage(msgParams: any, cb: (error, ...args) => any): void {
    const uuid = IPCUtil.uuid();
    this.electronService.ipcRenderer.once(IPCUtil.wrap('Wallet:signPersonalMessage', uuid), (events, error, signed) => {
      this.tabService.changeTab('viewer');
      if (error) {
        cb(deserializeError(error));
      } else {
        cb(null, signed);
      }
    });
    this.electronService.ipcRenderer.send('Wallet:signPersonalMessage', uuid, msgParams);
  }

  set rpcUrl(url: string) {
    this._rpcProvider.rpcUrl = url;
  }
}
