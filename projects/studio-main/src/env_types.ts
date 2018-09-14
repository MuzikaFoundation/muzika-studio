export interface EnvironmentType {
  production: boolean;
  base_api_url: string;
  env: 'dev' | 'prod' | 'stage';
  infuraAccessToken: string;
  rpcUrl: string;
  networkId: number;
}

export interface NetworkInfo {
  rpcUrl?: string;
  [networkInfo: string]: any;
}

export interface ProtocolInfo {
  mainNet?: NetworkInfo;
  testNet?: NetworkInfo;
  [otherNetwork: string]: NetworkInfo;
}

export interface EnvironmentTypeV2 {
  production: boolean;
  base_api_url: string;
  env: 'dev' | 'prod' | 'stage';
  protocol: {
    eth: ProtocolInfo;
    ont: ProtocolInfo;
    [protocolType: string]: ProtocolInfo;
  };
}
