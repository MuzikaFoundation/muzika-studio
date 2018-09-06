import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import * as Raven from 'raven-js';

const globalLocalMemoeryStorage = {};

@Injectable({providedIn: 'root'})
export class LocalStorage {

  constructor(@Inject(PLATFORM_ID) protected platformId: string) {
  }

  setItem(key: string, value: any) {
    if (isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined' && localStorage !== null) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        Raven.captureException(e.originalError || e);
      }
    }
    globalLocalMemoeryStorage[ key ] = value;
  }

  getItem(key: string, defaultValue?: string) {
    if (isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined' && localStorage !== null) {
      try {
        return localStorage.getItem(key) || defaultValue;
      } catch (e) {
        Raven.captureException(e.originalError || e);
      }
    }
    return globalLocalMemoeryStorage[ key ] || defaultValue;
  }

  removeItem(key: string) {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        Raven.captureException(e.originalError || e);
      }
    }
    delete globalLocalMemoeryStorage[ key ];
  }
}
