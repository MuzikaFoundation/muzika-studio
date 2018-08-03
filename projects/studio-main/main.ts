import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as os from 'os';
import { InstallMacDependencies } from './src/scripts/darwin/insall_magick';
import { MuzikaApp } from './src/application';
import { IpcWalletServiceInstance } from './src/ipc-wallet.service';
import { IpcMainServiceInstance } from './src/ipc.service';
import { IpfsServiceInstance } from './src/ipfs.service';
import { StorageServiceInstance } from './src/storage.service';
import { MuzikaConsole } from '@muzika/core';

const isDev = require('electron-is-dev');

MuzikaConsole.chalk = require('chalk');

let muzikaApp: MuzikaApp = null;

try {
  require('dotenv').config();
} catch {
  console.log('asar');
}

/**
 * Adds environment before opening the window.
 */
function AddEnvVariables() {
  if (!isDev) {
    // On Windows, add magick enviroment variables
    if (process.platform === 'win32') {
      process.env.MAGICK_CODER_MODULE_PATH = path.join(process.resourcesPath, 'magick_modules', 'coders');
      process.env.MAGICK_CODER_FILTER_PATH = path.join(process.resourcesPath, 'magick_modules', 'filters');
      process.env.MAGICK_CONFIGURE_PATH = path.join(process.resourcesPath, 'magick_modules');
      process.env.PATH = path.join(process.resourcesPath, 'magick_modules') + ';' + process.env.PATH;
    }

    console.log(process.env);
  }
}

/**
 * Waits unitl app is ready. It also registers the events that occur when
 * all windows closed or activated (for Mac OS)
 */
async function waitForAppReady() {
  app.on('window-all-closed', () => {
    // On Mac OS, it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On Mac OS, it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (muzikaApp !== null) {
      muzikaApp.activate();
    }
  });

  // wait for app ready
  await new Promise((resolve) => app.once('ready', resolve));
}


async function main() {
  try {
    // add environment variables
    AddEnvVariables();

    // wait for app ready
    await waitForAppReady();

    muzikaApp = new MuzikaApp(isDev);
    muzikaApp.activate();
  } catch (err) {
    app.quit();
    process.exit(1);
  }
}

main();
