import { applyMiddleware, createStore, Store } from 'redux';
import { IAppState, rootReducer } from '@muzika/core/electron';
import { AppActions } from '@muzika/core/electron';
import { Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Comparator } from '@angular-redux/store';
import { forwardToRenderer, replayActionMain } from 'electron-redux';

export class StoreService {
  store: Store;

  constructor() {
  }

  init(initialState: IAppState) {
    this.store = createStore(
      rootReducer,
      initialState,
      applyMiddleware(
        forwardToRenderer
      )
    );

    replayActionMain(this.store);

    Actions.app = new AppActions(this.store);
  }

  /**
   * Subscribes only a part of store.
   * @param selector
   */
  select(...selector: (string | number)[]) {
    return this._select(
      new Observable((observer) => {
        observer.next(this.store.getState());
        return this.store.subscribe(() => observer.next(this.store.getState()));
      }),
      selector
    );
  }

  private _select<T>(ob$: Observable<any>,
                     selector: (string | number)[] | string | number,
                     comparator?: Comparator) {
    return ob$.pipe(
      map(state => this._enter(state, Array.isArray(selector) ? selector : [selector])),
      distinctUntilChanged(comparator)
    );
  }

  private _enter(state: any, selector: (string | number)[]) {
    if (!state) {
      return state;
    }

    const [first, ...rest] = selector;

    if (state[first] === undefined) {
      return undefined;
    }

    if (rest.length === 0) {
      return state[first];
    }

    return this._enter(state[first], rest);
  }
}

export const Actions: {
  app?: AppActions
} = {};

export const StoreServiceInstance = new StoreService();
