import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class TabService {
  private _tabEvent: Subject<MuzikaTabs> = new BehaviorSubject<MuzikaTabs>('viewer');
  constructor() {
  }

  changeTab(tab: MuzikaTabs) {
    this._tabEvent.next(tab);
  }

  get tabChange(): Observable<MuzikaTabs> {
    return this._tabEvent.asObservable();
  }
}

export type MuzikaTabs = 'viewer' | 'wallet' | 'floating-wallet' | 'popup';
