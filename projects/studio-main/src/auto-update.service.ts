
import { autoUpdater } from 'electron-updater';
import { EventEmitter } from 'events';
import { Actions } from './store.service';

const debug = require('debug')('muzika:main:auto-update-service');
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
    debug('checking for update');

    if (MuzikaUpdater._isChecking) {
      debug('already checking for update');
      this.emit('error', new Error('already checking'));
      return;
    }

    if (MuzikaUpdater._updatable) {
      debug('already checking for update and downloaded');
      this.emit('error', new Error('already downloaded'));
      return;
    }

    // if in development mode, don't check update and just emit not update available event.
    if (isDev) {
      debug('update not available (because of develop mode)');
      this.emit('available', false);
      Actions.app.setUpdatable('not-available');
      return;
    }

    MuzikaUpdater._isChecking = true;

    autoUpdater.removeAllListeners('update-available');
    autoUpdater.removeAllListeners('update-not-available');

    autoUpdater.once('update-available', () => {
      debug('update available');
      this.emit('available', true);
      Actions.app.setUpdatable('downloading');
    });
    autoUpdater.once('update-not-available', () => {
      MuzikaUpdater._isChecking = false;
      debug('update is not available');
      this.emit('available', false);
      Actions.app.setUpdatable('not-available');

    });
    autoUpdater.once('update-downloaded', () => {
      MuzikaUpdater._isChecking = false;
      MuzikaUpdater._updatable = true;
      debug('update file is downloaded');
      this.emit('downloaded');
      Actions.app.setUpdatable('updatable');
    });

    autoUpdater.checkForUpdates();
    return this;
  }
}
