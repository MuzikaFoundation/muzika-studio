import { ipcMain } from 'electron';
import { IPCUtil } from './util/ipc-utils';
import * as ethWallet from 'ethereumjs-wallet';
import * as ethUtil from 'ethereumjs-util';
import { EthereumWalletItem, OntologyWalletItem, ProtocolType } from '../../core';
import { Account, Wallet, Crypto } from 'ontology-ts-sdk';

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
          const wallet = Wallet.create(name);
          wallet.addAccount(Account.create(new Crypto.PrivateKey(privateKey), password));
          keystore = <OntologyWalletItem>wallet.toJsonObj();
      }

      event.sender.send(IPCUtil.wrap('Wallet:generate', uuid), null, keystore);
    });

    ipcMain.on('Wallet:decrypt', (event, uuid, protocol: ProtocolType, keystore: any, password: string) => {
      try {
        let wallet;

        switch (protocol) {
          case 'eth':
            wallet = ethWallet.fromV3((keystore as EthereumWalletItem).wallet, password);
            event.sender.send(IPCUtil.wrap('Wallet:decrypt', uuid), null, wallet.getPrivateKey());
            break;

          case 'ont':
            wallet = Wallet.fromWalletFile(keystore);
            const account: Account = wallet.accounts[0];
            event.sender.send(
              IPCUtil.wrap('Wallet:decrypt', uuid),
              null,
              account.encryptedKey.decrypt(password, account.address, account.salt, {
                cost: wallet.scrypt.n,
                blockSize: wallet.scrypt.r,
                parallel: wallet.scrypt.p,
                size: wallet.scrypt.dkLen
              }).serializeWIF());
        }
      } catch (e) {
        event.sender.send(IPCUtil.wrap('Wallet:decrypt', uuid), e);
      }
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
