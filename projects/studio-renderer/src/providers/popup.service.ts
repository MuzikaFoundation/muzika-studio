import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class PopupService {
  private _popupEvent: Subject<string> = new BehaviorSubject<string>('');
  constructor(
    private router: Router,
  ) {
  }

  activate(popupName: string, extras?: NavigationExtras) {
    this._popupEvent.next(popupName);
    this.router.navigate([{ outlets: { popup: popupName }}], extras);
  }

  deactivate() {
    this._popupEvent.next('');
  }

  get popupChange$(): Observable<string> {
    return this._popupEvent.asObservable();
  }

  get popupClose$(): Observable<boolean> {
    return this.popupChange$.pipe(
      filter((popup) => popup === ''),
      map(() => true)
    );
  }
}
