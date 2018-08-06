import { AppReducer, AppState } from './app.reducer';
import { combineReducers, Reducer } from 'redux';

export interface IAppState {
  app: AppState;
}

export const rootReducer: Reducer<IAppState> = combineReducers<IAppState>({
  app: AppReducer
});
