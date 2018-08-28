import { IAppState, rootReducer } from '@muzika/core';
import { combineReducers, Reducer } from 'redux';

export interface MainAppState extends IAppState {

}

export const MainRootReducer: Reducer<MainAppState> = combineReducers<MainAppState>(Object.assign({

}, rootReducer));
