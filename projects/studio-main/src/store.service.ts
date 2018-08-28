import { applyMiddleware, createStore, Store } from 'redux';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { forwardToRenderer, replayActionMain } from 'electron-redux';
import { MainAppState, MainRootReducer } from './reducers';
import { AppActions } from '@muzika/core';

export class StoreService {
  store: Store;

  constructor() {
  }

  init(initialState: MainAppState) {
    this.store = createStore(
      MainRootReducer,
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
                     selector: (string | number)[] | string | number) {
    return ob$.pipe(
      map(state => this._enter(state, Array.isArray(selector) ? selector : [selector]))
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
