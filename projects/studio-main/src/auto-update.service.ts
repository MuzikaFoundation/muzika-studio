
import { autoUpdater } from 'electron-updater';
import { EventEmitter } from 'events';

const isDev = require('electron-is-dev');

export class MuzikaUpdater extends EventEmitter {
  private static _isChecking = false;
  private static _updatable = false;

  constructor() {
    super();
  }

  /**
   * This static method must be called after download the latest version.
   */
  static update() {
    if (this._updatable) {
      throw new Error('Not updatable');
    }

    autoUpdater.quitAndInstall();
  }

  checkUpdate() {
    if (MuzikaUpdater._isChecking) {
      this.emit('error', new Error('already checking'));
      return;
    }

    if (MuzikaUpdater._updatable) {
      this.emit('error', new Error('already downloaded'));
      return;
    }

    // if in development mode, don't check update and just emit not update available event.
    if (isDev) {
      this.emit('available', false);
      return;
    }

    MuzikaUpdater._isChecking = true;

    autoUpdater.removeAllListeners('update-available');
    autoUpdater.removeAllListeners('update-not-available');

    autoUpdater.once('update-available', () => this.emit('available', true));
    autoUpdater.once('update-not-available', () => {
      MuzikaUpdater._isChecking = false;
      this.emit('available', false);
    });
    autoUpdater.once('update-downloaded', () => {
      MuzikaUpdater._isChecking = false;
      MuzikaUpdater._updatable = true;
      this.emit('downloaded');
    });

    autoUpdater.checkForUpdates();
  }
}
