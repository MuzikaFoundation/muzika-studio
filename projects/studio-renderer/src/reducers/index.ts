import { IAppState, RootReducer } from '@muzika/core';

export interface RendererAppState extends IAppState {
  version: string;
}

export const RendererRootReducer = Object.assign({
  version: () => '0.0.1'
}, RootReducer);
