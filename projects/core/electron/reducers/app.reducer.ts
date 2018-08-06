import { tassign } from 'tassign';
import { PayloadAction } from '../../common/models/redux-action';

export class AppActionType {
  static SET_SERVICE_STATUS = '[app] set service status';
  static SET_UPDATABLE = '[app] set updatable';
}

export interface AppState {
  updatable: boolean;
  serviceStatus: {
    [serviceName: string]: boolean
  };
}

const initialState: AppState = {
  updatable: undefined,
  serviceStatus: {}
};

export function AppReducer(state: AppState = initialState, action: PayloadAction): AppState {
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
