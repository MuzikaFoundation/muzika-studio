import { combineReducers, Reducer } from 'redux';
import { IAppState, RootReducer } from '../../../core/common/redux/reducers/index';

export interface MainAppState extends IAppState {
  version: string;
}

export const MainRootReducer: Reducer<MainAppState> = combineReducers<MainAppState>(Object.assign({
  version: () => '0.0.1'
}, RootReducer));
