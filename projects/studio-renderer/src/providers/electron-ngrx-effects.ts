import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { ipcRenderer } from 'electron';

@Injectable({ providedIn: 'root' })
export class ElectronNgrxEffects {
  constructor(private actions$: Actions) {
  }

  @Effect({ dispatch: false })
  logActions$ = this.actions$.pipe(tap((action: any) => {
    if (
      action.type.substr(0, 2) !== '@@'
      && action.type.substr(0, 10) !== 'redux-form'
      && (
        !action.meta
        || !action.meta.scope
        || action.meta.scope !== 'local'
      )
    ) {
      ipcRenderer.send('redux-action', action);

      // stop action in-flight
      // eslint-disable-next-line consistent-return
      return;
    }
  }));
}
