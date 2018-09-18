import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class PopupService {
  private _popupEvent: Subject<string> = new BehaviorSubject<string>('');
  private _prevPopup: string;

  constructor(
    private router: Router,
  ) {
  }

  /**
   * Generates a new popup.
   * @param popupName popup name. It is the same with router name.
   * @param extras extra options for navigation such as query params and etc.
   */
  activate(popupName: string, extras?: NavigationExtras) {
    this._popupEvent.next(popupName);
    this.router.navigate([{ outlets: { popup: popupName }}], extras);
    this._prevPopup = popupName;
  }

  /**
   * Closes a current popup.
   */
  deactivate() {
    this._popupEvent.next('');
  }

  /**
   * get Observable instance for observing popup open.
   */
  get popupOpen$(): Observable<string> {
    return this.popupChange$.pipe(
      filter((popup) => popup !== '')
    );
  }

  /**
   * get Observable instance for observing popup close.
   */
  get popupClose$(): Observable<string> {
    return this.popupChange$.pipe(
      filter((popup) => popup === ''),
      map(() => this._prevPopup)
    );
  }

  /**
   * get Observable instance for observing popup action. It is used internally for
   * popupOpen$ or popupClose$.
   */
  get popupChange$(): Observable<string> {
    return this._popupEvent.asObservable();
  }
}
