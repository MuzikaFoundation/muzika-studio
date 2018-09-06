import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ElectronService } from './electron.service';

@Injectable({ providedIn: 'root' })
export class ElectronLocalStorage {

  constructor(@Inject(PLATFORM_ID) protected platformId: Object,
              private electronService: ElectronService) {
    /**
     * @TODO think another way to share data inside localStorage
     * Token is must shared between main and renderer
     */
    this.electronService.storage.set('token', this.getItem('token'));
  }

  setItem(key: string, value: any) {
    localStorage.setItem(key, value);
    this.electronService.storage.set(key, value);
  }

  getItem(key: string, defaultValue?: string) {
    return localStorage.getItem(key) || defaultValue;
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
    this.electronService.storage.remove(key);
  }
}
