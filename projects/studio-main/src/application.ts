
import { app } from 'electron';
import { BrowserWindow } from 'electron';
import * as url from 'url';
import * as path from 'path';
import { ipfsPath } from 'go-ipfs-wrapper';
import { IpfsService, IpfsServiceInstance } from './ipfs.service';
import { IpcMainServiceInstance } from './ipc.service';
import { IpcWalletServiceInstance } from './ipc-wallet.service';
import { StorageServiceInstance } from './storage.service';
import * as ms from 'ms';
import { MuzikaUpdater } from './auto-update.service';
import { MuzikaConsole } from '@muzika/core';

export class MuzikaApp {
  mainWindow: BrowserWindow;
  instancesForCheck = [IpfsServiceInstance];
  private _updateChecker: MuzikaUpdater;
  private _healthyCheckHandler;

  private _isDevMode: boolean;
  private _options: any;

  constructor() {
  }


  /**
   * Constructs an application manager.
   * @param {boolean} _isDevMode whether it is development mode or not
   * @param {any} _options
   */
  init(_isDevMode: boolean, _options?: any) {
    this._isDevMode = _isDevMode;
    this._options = _options;
    this._updateChecker = new MuzikaUpdater();

    if (!_options) {
      this._options = {};
    }

    // initialize main service.
    IpcMainServiceInstance.init();
    StorageServiceInstance.init();

    // set ipfs path
    IpfsService.setIpfsExecPath((_isDevMode) ? ipfsPath : ipfsPath.replace('app.asar', 'app.asar.unpacked'));
  }

  public activate() {
    this.mainWindow = this._createMainWindow();
    this.mainWindow.on('show', () => {
      // initialize service instances.
      IpfsServiceInstance.init((this._isDevMode) ? '' : app.getPath('userData'));
      IpcWalletServiceInstance.init();

      // for every 10 seconds, check instances that are healthy.
      this._healthyCheckHandler = setInterval(() => this.restoreInstances(),
        this._options.healthyTimeInterval || ms('10s'));

      MuzikaConsole.log('Check for update!');
      this._updateChecker.once('available', (available) => {
          MuzikaConsole.log('Updatable : ', available);

          // if no need to update, close the loading screen and show the main window
          if (!available) {
            const startWindow = new BrowserWindow({
              width: 1340,
              height: 700,
              minWidth: 700,
              minHeight: 400,
              resizable: true,
              titleBarStyle: 'hidden',
              webPreferences: {
                plugins: true,
                nodeIntegration: true
              }
            });

            startWindow.setMenu(null);

            if (this._isDevMode) {
              // https://github.com/yan-foto/electron-reload/issues/16
              require('electron-reload')(__dirname, {
                electron: require(`${__dirname}/../../../node_modules/electron`)
              });
              startWindow.loadURL('http://localhost:4200');
            } else {
              startWindow.loadURL(url.format({
                pathname: path.join(__dirname, '../renderer/index.html'),
                protocol: 'file:',
                slashes: true
              }));
            }
            startWindow.webContents.openDevTools();

            // close the loading screen, and remove closed listener
            this.mainWindow.hide();
            this.mainWindow.removeAllListeners('closed');
            this.mainWindow.close();

            // change the main window reference
            this.mainWindow = startWindow;
          }
        });

      setTimeout(() => this._updateChecker.checkUpdate(), 2000);
    });
    this.mainWindow.on('closed', () => this.mainWindow = null);
  }

  /**
   * Try to restore unhealthy instances.
   */
  public async restoreInstances() {
    const unhealthyInstances = await this.getUnhealthyInstances();

    // try to restore all unhealthy instances.
    Promise.all(unhealthyInstances.map((instance) => instance.restore()))
      .then((successes) => {
      });
  }

  /**
   * Returns all unhealthy instances.
   */
  public async getUnhealthyInstances() {
    // check all instances healthy and get boolean array
    // that represents whether they are healthy respectively
    const healthy = await Promise.all(this.instancesForCheck.map(instance => instance.isHealthy));

    // return only unhealthy instances
    return this.instancesForCheck.filter((_, index) => !healthy[index]);
  }

  private _createMainWindow(): BrowserWindow {
    // const mainWindow = new BrowserWindow({
    //   width: 1340,
    //   height: 700,
    //   minWidth: 700,
    //   minHeight: 400,
    //   resizable: true,
    //   titleBarStyle: 'hidden',
    //   webPreferences: {
    //     plugins: true,
    //     nodeIntegration: true
    //   }
    // });
    //
    // if (this._isDevMode) {
    //   // https://github.com/yan-foto/electron-reload/issues/16
    //   require('electron-reload')(__dirname, {
    //     electron: require(`${__dirname}/../../../node_modules/electron`)
    //   });
    //   mainWindow.loadURL('http://localhost:4200');
    // } else {
    //   mainWindow.loadURL(url.format({
    //     pathname: path.join(__dirname, '../renderer/index.html'),
    //     protocol: 'file:',
    //     slashes: true
    //   }));
    // }
    // mainWindow.webContents.openDevTools();
    //
    // return mainWindow;

    const mainWindow = new BrowserWindow({
      width: 300,
      height: 300,
      resizable: true,
      titleBarStyle: 'hidden',
      frame: false,
      show: false,
    });

    if (this._isDevMode) {
      // https://github.com/yan-foto/electron-reload/issues/16
      require('electron-reload')(__dirname, {
        electron: require(`${__dirname}/../../../node_modules/electron`)
      });
      mainWindow.loadURL('http://localhost:4200/index.html#/loading-screen');
    } else {
      mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../renderer/index.html#/loading-screen'),
        protocol: 'file:',
        slashes: true
      }));
    }

    return mainWindow;
  }

  private _createAboutWindow() {
  }

}

export const MuzikaAppInstance = new MuzikaApp();
