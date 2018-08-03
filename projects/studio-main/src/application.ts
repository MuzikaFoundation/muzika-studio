
import { app } from 'electron';
import { BrowserWindow } from 'electron';
import * as url from 'url';
import * as path from 'path';
import { IpfsServiceInstance } from './ipfs.service';
import { IpcMainServiceInstance } from './ipc.service';
import { IpcWalletServiceInstance } from './ipc-wallet.service';
import { StorageServiceInstance } from './storage.service';
import * as ms from 'ms';

export class MuzikaApp {
  mainWindow: BrowserWindow;
  instancesForCheck = [IpfsServiceInstance];
  private _healthyCheckHandler;

  /**
   * Constructs an application manager.
   * @param {boolean} _isDevMode whether it is development mode or not
   * @param {any} _options
   */
  constructor(
    private _isDevMode: boolean,
    private _options?: any
  ) {
    if (!_options) {
      this._options = {};
    }

    // initialize service instances for muzika application.
    IpfsServiceInstance.init((_isDevMode) ? '' : app.getPath('userData'));
    IpcMainServiceInstance.init();
    IpcWalletServiceInstance.init();
    StorageServiceInstance.init();

    // for every 10 seconds, check instances that are healthy.
    this._healthyCheckHandler = setInterval(() => this.restoreInstances(),
      this._options.healthyTimeInterval || ms('10s'));
  }

  public activate() {
    this.mainWindow = this._createMainWindow();
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
    const mainWindow = new BrowserWindow({
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

    if (this._isDevMode) {
      // https://github.com/yan-foto/electron-reload/issues/16
      require('electron-reload')(__dirname, {
        electron: require(`${__dirname}/../../../node_modules/electron`)
      });
      mainWindow.loadURL('http://localhost:4200');
    } else {
      mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../renderer/index.html'),
        protocol: 'file:',
        slashes: true
      }));
    }
    mainWindow.webContents.openDevTools();

    return mainWindow;
  }

  private _createAboutWindow() {
  }

}
