import { MuzikaConsole } from '@muzika/core';
import { ipfsPath, IpfsProcess } from 'go-ipfs-wrapper';
import * as IpfsAPI from 'ipfs-api';
import * as path from 'path';
import * as request from 'request';
import { Observable } from 'rxjs';
import { electronEnvironment } from './environment';

const isDev = require('electron-is-dev');
IpfsProcess.setIpfsPath(isDev ? ipfsPath : ipfsPath.replace('app.asar', 'app.asar.unpacked'));

export class IpfsService {
  ipfsProcess: IpfsProcess;
  api: IpfsAPI;
  muzikaPeers: string[] = [];
  isReady = false;

  constructor() {
  }

  init(directoryPath) {
    this.ipfsProcess = new IpfsProcess(path.join(directoryPath, 'ipfs-muzika'));
    // if ipfs node generated, connect to a remote storage for speeding up file exchange.
    this.ipfsProcess.on('start', () => this.connectLocalIpfsApi());
    this.ipfsProcess.on('error', (err) => {

      // if ipfs occurs error when initializing daemon, it could be run ipfs already in os.
      // so try to connect it instead.
      if (Object.values(IpfsProcess.ERROR).includes(err)) {
        this.connectLocalIpfsApi();
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

  connectPeer(peer): Promise<void> {
    return this.api.swarm.connect(peer);
  }

  peers(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.api.swarm.peers()
        .then((peerInfos) => resolve(peerInfos))
        .catch(err => reject(err));
    });
  }

  id(): Promise<any> {
    return this.api.id();
  }

  add(uploadQueue, options: any = {}): Promise<any> {
    return this.api.files.add(uploadQueue, options);
  }

  get(hash): Promise<void> {
    return this.api.files.get(hash);
  }

  getRandomPeer() {
    return this.muzikaPeers[Math.floor(Math.random() * this.muzikaPeers.length)];
  }

  connectLocalIpfsApi() {
    MuzikaConsole.log('IPFS node is ready');
    this.api = IpfsAPI('localhost', '5001', {protocol: 'http'});
    // get IPFS nodes list
    request.get({
        url: `${electronEnvironment.base_api_url}/seed/ipfs`,
        json: true
      },
      (error, response, body) => {
        if (!error) {
          for (const ipfsNode of body) {
            this.connectPeer(ipfsNode.ID)
              .then(() => {
                MuzikaConsole.log('CONNECTED WITH MUZIKA RELAY NODE : ', ipfsNode.ID);
                // if one of the IPFS is connected, ready status to true
                this.muzikaPeers.push(ipfsNode.APIServer);
                this.isReady = true;
              });
          }
        } else {
          MuzikaConsole.error('Not connected with muzika-platform-server..');
        }
      }
    );
  }
}

export const IpfsServiceInstance = new IpfsService();
