import { combineReducers, Reducer } from 'redux';
import { IAppState, RootReducer } from '../../../core/common/redux/reducers/index';

export interface MainAppState extends IAppState {

}

export const MainRootReducer: Reducer<MainAppState> = combineReducers<MainAppState>(Object.assign({

}, RootReducer));
