import { Store } from 'redux';
import { AppActionType } from '../reducers/app.reducer';

export class AppActions {
  constructor(private store: Store) {
  }

  /**
   * Sets the application is updatable or not.
   * @param updatable "downloading" represents that it is downloading the update file,
   * "not-available" if no need to update, and "updatable" if finished to download
   * update file so ready to update.
   */
  setUpdatable(updatable: 'downloading' | 'not-available' | 'updatable') {
    this.store.dispatch({
      type: AppActionType.SET_UPDATABLE,
      payload: { updatable }
    });
  }

  /**
   * Sets the service status.
   * @param serviceName service name. (ipfs, ...)
   * @param status whether the service is down or not.
   */
  setServiceStatus(serviceName: string, status: boolean) {
    this.store.dispatch({
      type: AppActionType.SET_SERVICE_STATUS,
      payload: { serviceName, status }
    });
  }
}
