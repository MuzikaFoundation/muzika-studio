
import { Inject, Injectable } from '@angular/core';
import { EnvironmentTypeV2, IAppState, NetworkType, OntologyDappProvider, OntologyRpcSubProvider, OntologyWalletItem } from '@muzika/core';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Signature } from 'ontology-dapi';
import { EnvironmentV2Token } from '@muzika/core/angular';
import { TabService } from '../tab.service';
import { Router } from '@angular/router';
import { IPCUtil } from '../../util/ipc-utils';
import { ElectronService } from '../electron.service';
import * as deserializeError from 'deserialize-error';
const debug = require('debug')('muzika:renderer:ontology-provider');

/**
 * Ontology dapp provider that uses the wallet in the store.
 */
@Injectable({providedIn: 'root'})
export class OntologyProvider extends OntologyDappProvider {
  rpcProvider: OntologyRpcSubProvider;

  currentNetwork: NetworkType;
  currentAccount: {
    keystore: OntologyWalletItem,
    password: string
  } = { keystore: null, password: '' };

  constructor(
    private store: Store<IAppState>,
    private tabService: TabService,
    private router: Router,
    private electronService: ElectronService,
    @Inject(EnvironmentV2Token) private environment: EnvironmentTypeV2,
  ) {
    super();

    this.rpcProvider = new OntologyRpcSubProvider();
    this.registerProvider(this.rpcProvider);

    // if network (test net / main net) changed, also switch the RPC url.
    this.store.select('app', 'network').subscribe((network) => {
      this.currentNetwork = network;
      const networkInfo = this.environment.protocol.ont[network];
      this.rpcProvider.setRpcUrl(`${networkInfo.rpcUrl}:${networkInfo.port}`);
    });

    combineLatest(
      this.store.select('app', 'protocol'),
      this.store.select('app', 'currentWallet'),
      this.store.select('app', 'currentWalletPassword'),
    ).pipe(
      filter(([protocol]) => protocol === 'ont'),
    ).subscribe(([protocol, currentWallet, password]) => {
      this.currentAccount.keystore = currentWallet as OntologyWalletItem;
      this.currentAccount.password = password;
    });
  }

  async getAccount(): Promise<string> {
    debug('asset.getAccount called');
    return (this.currentAccount) ? this.currentAccount.keystore.accounts[0].address : null;
  }

  async signMessage({ message }: { message: string }): Promise<Signature> {
    debug('message.signMessage called');
    return new Promise<Signature>((resolve, reject) => {
      this.tabService.changeTab('floating-wallet');
      this.router.navigate([{outlets: {wallet: 'sign-message'}}]);

      const uuid = IPCUtil.uuid();
      this.electronService.ipcRenderer.once(IPCUtil.wrap('Wallet:signPersonalMessage', uuid), (events, error, signed) => {
        this.tabService.changeTab('viewer');
        (error) ? reject(deserializeError(error)) : resolve(signed);
      });

      this.electronService.ipcRenderer.send('Wallet:signPersonalMessage', uuid, {
        from: this.currentAccount.keystore.accounts[0].address,
        data: message
      });
    });

  }
}
