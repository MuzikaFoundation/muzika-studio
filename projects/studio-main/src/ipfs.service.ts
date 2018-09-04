import { ipfsPath, IpfsProcess } from 'go-ipfs-wrapper';
import * as IpfsAPI from 'ipfs-api';
import * as path from 'path';
import * as request from 'request';
import { from, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Actions } from './store.service';
import { IpfsObject } from '../../core/common/models';
import { IpfsUtil } from '../../core/common/structures';
import { MuzikaConsole } from '../../core/common';


export class IpfsService {
  ipfsProcess: IpfsProcess;
  api: IpfsAPI;
  isReady = false;

  constructor() {
  }

  /**
   * Sets the ipfs executable path.
   * @param ipfsExecPath path of ipfs executable file.
   */
  static setIpfsExecPath(ipfsExecPath: string) {
    IpfsProcess.setIpfsPath(ipfsExecPath);
  }

  /**
   * Check a file (or a directory) is alive in IPFS network. It can take
   * a long time to check the file is alive.
   * @param hash the hash of the file.
   * @param timeout the timeout to check
   * @param retry the number of retires when timeout
   */
  async checkObjectAlive(hash: string, timeout?: number, retry?: number) {
    // if retry is not defined, don't retry
    if (!Number.isInteger(retry)) {
      retry = 1;
    }

    // retry checking but failed to response, reject
    if (retry < 1) {
      throw new Error('object is not alive');
    }

    return await new Promise((resolve, reject) => {
      request.get(`https://ipfs.io/ipfs/${hash}`, { timeout })
        .once('response', (response) => {
          // if response from server, check status code and decide
          // whether it is healthy (response code == 200) or not.
          if (response.statusCode !== 200) {
            throw new Error('object is not alive');
          }

          resolve();
        })
        .once('error', (err) => {
          // if error (almost by TIMEOUT), try again
          this.checkObjectAlive(hash, timeout, retry - 1)
            .then(() => resolve());
        });
    });
  }

  /**
   * Initialize ipfs service.
   * @param directoryPath the directory path for IPFS service to work.
   */
  init(directoryPath: string) {
    this.ipfsProcess = new IpfsProcess(path.join(directoryPath, 'ipfs-muzika'));
    // if ipfs node generated, connect to a remote storage for speeding up file exchange.
    this.ipfsProcess.on('start', () => this.connectLocalIpfs());

    // if ipfs occurs error when initializing daemon, it could be run ipfs already in os.
    // so try to connect it instead.
    this.ipfsProcess.on('error', (err) => {
      if (Object.values(IpfsProcess.ERROR).includes(err)) {
        this.connectLocalIpfs();
      }
    });

    this.ipfsProcess.run();
  }

  sub(arg): Promise<any> {
    return Observable.create(observer => {
      this.api.pubsub.subscribe(arg, {discover: true}, (msg) => {
        observer.next(msg.data);
      });
    });
  }

  pub(arg, msg) {
    this.api.pubsub.publish(arg, new this.api.types.Buffer(msg));
  }

  async connect(peer) {
    return this.api.swarm.connect(peer);
  }

  async peers() {
    return this.api.swarm.peers();
  }

  async id() {
    return this.api.id();
  }

  async add(uploadQueue: IpfsObject | IpfsObject[], options?: any): Promise<IpfsObject> {
    return IpfsUtil.flatArray2Tree(this.api.files.add(
      // if tree structure, convert to flat array for ipfs
      Array.isArray(uploadQueue) ? uploadQueue : IpfsUtil.tree2flatArray(uploadQueue),
      options
    ));
  }

  async get(hash): Promise<IpfsObject> {
    return IpfsUtil.flatArray2Tree(this.api.files.get(hash));
  }

  /**
   * Restores IPFS instance if it is down.
   * @returns {Promise<void>}
   */
  async restore() {
    // TODO: Restore IPFS
    return false;
  }

  /**
   * Returns true if interacting successfully with IPFS or false if not.
   */
  isHealthy(): Observable<boolean> {
    return from(this.id()).pipe(
      // if response from ipfs
      map(() => {
        Actions.app.setServiceStatus('ipfs', true);
        return true;
      }),
      catchError(err => {
        Actions.app.setServiceStatus('ipfs', false);
        return of(false);
      })
    );
  }

  connectLocalIpfs() {
    MuzikaConsole.log('IPFS node is ready');
    this.api = IpfsAPI('localhost', '5001', {protocol: 'http'});
    this.isReady = true;

    // healthy check
    this.isHealthy().subscribe();
  }
}

export const IpfsServiceInstance = new IpfsService();
