
import { BrowserWindowConstructorOptions } from 'electron';

export class WinOpts {
  static getLoadingScreenOpts(): BrowserWindowConstructorOptions {
    return {
      width: 300,
      height: 300,
      resizable: true,
      titleBarStyle: 'hidden',
      frame: false,
      show: false,
    };
  }

  static getMainWindowOpts(): BrowserWindowConstructorOptions {
    return {
      width: 1340,
      height: 700,
      minWidth: 700,
      minHeight: 400,
      backgroundColor: '#2e2c29',
      resizable: true,
      titleBarStyle: 'hidden',
      show: false,
      webPreferences: {
        plugins: true,
        nodeIntegration: true
      }
    };
  }
}

