import {BlockWithTransactionData, Provider as Web3Provider} from '@0xproject/types';
import {Inject, Injectable} from '@angular/core';
import * as ProviderEngine from 'web3-provider-engine';
import * as CacheSubprovider from 'web3-provider-engine/subproviders/cache';
import * as FilterSubprovider from 'web3-provider-engine/subproviders/filters';
import * as HookedWalletEthTxSubprovider from 'web3-provider-engine/subproviders/hooked-wallet-ethtx';
import * as RpcSubprovider from 'web3-provider-engine/subproviders/rpc';
import {WalletStorageService} from './services/wallet-storage.service';

@Injectable({providedIn: 'root'})
export class Web3WalletProvider implements Web3Provider {
  private engine: ProviderEngine;
  private selectedAddress: string;

  constructor(@Inject('RPC_URL') private rpcUrl,
              private walletStorage: WalletStorageService) {
  }

  create(blockTracker?: (block: BlockWithTransactionData) => any) {
    if (this.engine) {
      this.stop();
    }

    this.engine = new ProviderEngine({pollingInterval: 20000});

    this.engine.addProvider(new CacheSubprovider());
    this.engine.addProvider(new FilterSubprovider());
    this.engine.addProvider(new HookedWalletEthTxSubprovider({
      getAccounts: (cb) => {
        cb(null, this.selectedAddress ? [this.selectedAddress] : []);
      },
      getPrivateKey: (address, cb) => {
        cb(null, this.walletStorage.privateKeyOf({
          protocol: 'eth',
          address: this.selectedAddress,
          password: ''
        }));
      }
    }));
    this.engine.addProvider(new RpcSubprovider({rpcUrl: this.rpcUrl}));

    if (blockTracker) {
      this.engine.on('block', blockTracker);
    }

    this.engine.start();
  }

  sendAsync(...args) {
    this.engine.sendAsync.apply(this.engine, args);
  }

  stop() {
    this.engine.stop();
  }

  changeAddress(address: string) {
    this.selectedAddress = address;
  }
}
