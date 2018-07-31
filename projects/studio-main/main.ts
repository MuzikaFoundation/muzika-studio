import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';

const isDev = require('electron-is-dev');

/* For Imagemagick Env */
if (!isDev) {
  process.env.MAGICK_CODER_MODULE_PATH = path.join(process.resourcesPath, 'magick_modules', 'coders');
  process.env.MAGICK_CODER_FILTER_PATH = path.join(process.resourcesPath, 'magick_modules', 'filters');
  process.env.MAGICK_CONFIGURE_PATH = path.join(process.resourcesPath, 'magick_modules');

  // On Mac OS, add magick library path.
  if (process.platform === 'darwin') {
    process.env.DYLD_LIBRARY_PATH = path.join(process.resourcesPath, 'magick_modules');
  } else if (process.platform === 'win32') {
    process.env.PATH = path.join(process.resourcesPath, 'magick_modules') + ';' + process.env.PATH;
  }

  console.log(process.env);
}

import { IpcWalletServiceInstance } from './src/ipc-wallet.service';
import { IpcMainServiceInstance } from './src/ipc.service';
import { IpfsServiceInstance } from './src/ipfs.service';
import { StorageServiceInstance } from './src/storage.service';
import { MuzikaConsole } from '@muzika/core';

MuzikaConsole.chalk = require('chalk');

let win;

try {
  require('dotenv').config();
} catch {
  console.log('asar');
}

function createWindow() {

  const electronScreen = screen;
  // const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    width: 1340,
    height: 700,
    minWidth: 700,
    minHeight: 400,
    resizable: true,
    webPreferences: {
      plugins: true,
      nodeIntegration: true
    }
  });

  // disable menu
  win.setMenu(null);

  MuzikaConsole.info('test');

  if (isDev) {
    // https://github.com/yan-foto/electron-reload/issues/16
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/../../node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'renderer/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }
  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    createWindow();

    IpfsServiceInstance.init((isDev) ? '' : app.getPath('userData'));
    IpcMainServiceInstance.init();
    IpcWalletServiceInstance.init();
    StorageServiceInstance.init();
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
