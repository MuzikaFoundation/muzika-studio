import { EventEmitter, Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, remote, shell } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as ipfs from 'ipfs-api';

@Injectable({providedIn: 'root'})
export class ElectronService {

  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  shell: typeof shell;
  childProcess: typeof childProcess;
  fs: typeof fs;
  ipfs: typeof ipfs;
  storage: { get: (key: string) => any, set: (key: string, value: any) => void, remove: (key: string) => void };

  onDragFile: EventEmitter<File> = new EventEmitter<File>();

  constructor() {
    // Conditional imports
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;
      this.shell = window.require('electron').shell;
      this.storage = window.require('electron').remote.getGlobal('muzikaStorage');

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      this.ipfs = window.require('ipfs-api');
    }
  }

  isElectron = () => {
    return window && window.process && window.process.type;
  }

}
