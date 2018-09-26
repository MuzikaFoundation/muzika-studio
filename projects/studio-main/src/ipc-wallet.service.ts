import { ipcMain } from 'electron';
import { IPCUtil } from './util/ipc-utils';
import * as ethWallet from 'ethereumjs-wallet';
import * as ethUtil from 'ethereumjs-util';
import { Crypto, Wallet, Account } from 'ontology-ts-sdk';
import { EthereumWalletItem, OntologyWalletItem } from '../../core/common/models/blockchain';

// ipcMain.on('synchronous-message', (event, arg) => {
//   MuzikaConsole.log(arg); // prints "ping"
//   event.returnValue = 'pong';
// });

export class IpcWalletService {
  constructor() {
  }

  init() {
    ipcMain.on('Wallet:generate', (event, uuid, protocol: 'eth' | 'ont', name, privateKey, password) => {
      let keystore = {};
      switch (protocol) {
        case 'eth':
          privateKey = ethUtil.toBuffer(ethUtil.addHexPrefix(privateKey));
          if (ethUtil.isValidPrivate(privateKey)) {
            keystore = <EthereumWalletItem>{
              name: name,
              wallet: ethWallet.fromPrivateKey(privateKey).toV3(password)
            };
          }
          break;

        case 'ont':
          privateKey = new Crypto.PrivateKey(privateKey);
          const wallet = Wallet.create(name);
          wallet.addAccount(Account.create(privateKey, password));
          keystore = <OntologyWalletItem>wallet.toJsonObj();
      }

      event.sender.send(IPCUtil.wrap('Wallet:generate', uuid), null, keystore);
    });

    /* For getAccounts */
    ipcMain.on('Wallet:getAccounts', (event, uuid) => {
      // Request wallet application getting accounts
      event.sender.send('WalletProvider:getAccounts', uuid);
    });

    ipcMain.on('WalletProvider:getAccounts', (event, uuid, error, accounts) => {
      // On receive accounts
      event.sender.send(IPCUtil.wrap('Wallet:getAccounts', uuid), error, accounts);
    });

    /* For signTransaction */
    ipcMain.on('Wallet:signTransaction', (event, uuid, txData) => {
      event.sender.send('WalletProvider:signTransaction', uuid, txData);
    });

    ipcMain.on('WalletProvider:signTransaction', (event, uuid, error, signed) => {
      event.sender.send(IPCUtil.wrap('Wallet:signTransaction', uuid), error, signed);
    });

    /* For signPersonalMessage */
    ipcMain.on('Wallet:signPersonalMessage', (event, uuid, msgParams) => {
      event.sender.send('WalletProvider:signPersonalMessage', uuid, msgParams);
    });

    ipcMain.on('WalletProvider:signPersonalMessage', (event, uuid, error, signed) => {
      event.sender.send(IPCUtil.wrap('Wallet:signPersonalMessage', uuid), error, signed);
    });
  }
}

export const IpcWalletServiceInstance = new IpcWalletService();
