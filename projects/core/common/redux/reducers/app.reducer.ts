import { tassign } from 'tassign';
import { PayloadAction } from '../../models';

export class AppActionType {
  static SET_SERVICE_STATUS = '/application/set-service-status';
  static SET_UPDATABLE = '/application/set-updatable';
}

export interface AppState {
  updatable: string;
  serviceStatus: {
    [serviceName: string]: boolean
  };
}

export const appInitialState: AppState = {
  updatable: undefined,
  serviceStatus: {}
};

export function AppReducer(state: AppState = appInitialState, action: PayloadAction): AppState {
  switch (action.type) {
    case AppActionType.SET_UPDATABLE:
      return tassign(state, {
        updatable: action.payload.updatable
      });

    case AppActionType.SET_SERVICE_STATUS:
      return tassign(state, {
        serviceStatus: tassign(state.serviceStatus, {
          [action.payload.serviceName]: action.payload.status
        })
      });

    default:
      return state;
  }
}
