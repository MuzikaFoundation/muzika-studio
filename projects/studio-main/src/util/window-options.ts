
import { BrowserWindowConstructorOptions } from 'electron';
import * as path from 'path';
import { platform } from 'os';
import { env } from 'process';

export class WindowType {
  static LOADING_SCREEN = 'loading-screen';
  static MAIN = 'main-window';
}

export class WinOpts {
  static WINDOW_TITLE = 'Muzika - Artist Studio';

  /**
   * Returns the platform type for rendering.
   * if defining an environment variable for rendering platform, set platform
   * to it, not the platform in development. It is useful if you want to render
   * like windows on mac os.
   * If you want to render like windows on mac os, set `export RENDER_PLATFORM=win32`
   * before executing the electron.
   */
  static getRenderingPlatform(): string {
    const forceRenderPlatform = env['RENDER_PLATFORM'];
    return forceRenderPlatform || platform();
  }

  static getLoadingScreenOpts(): BrowserWindowConstructorOptions {
    return {
      title: WinOpts.WINDOW_TITLE,
      icon: path.join(__dirname, '..', '..', 'assets', 'muzika.png'),
      width: 300,
      height: 300,
      resizable: true,
      titleBarStyle: 'customButtonsOnHover',
      frame: false,
      show: false,
      minimizable: false,
      fullscreenable: false,
      skipTaskbar: true,
    };
  }

  static getMainWindowOpts(): BrowserWindowConstructorOptions {
    return {
      title: WinOpts.WINDOW_TITLE,
      icon: path.join(__dirname, '..', '..', 'assets', 'muzika.png'),
      width: 1340,
      height: 700,
      minWidth: 700,
      minHeight: 400,
      backgroundColor: '#2e2c29',
      resizable: true,
      titleBarStyle: (this.getRenderingPlatform() === 'darwin') ? 'hidden' : 'customButtonsOnHover',
      show: false,
      frame: false,
      webPreferences: {
        plugins: true,
        nodeIntegration: true
      }
    };
  }
}

