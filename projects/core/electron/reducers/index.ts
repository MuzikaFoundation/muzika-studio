import { AppReducer, AppState } from './app.reducer';
import { combineReducers, Reducer } from 'redux';
import { UserReducer, UserState } from '@muzika/core';

export interface IAppState {
  app: AppState;
  user: UserState;              // Only renderer can change state
}

export const rootReducer: Reducer<IAppState> = combineReducers<IAppState>({
  app: AppReducer,
  user: UserReducer,
});
