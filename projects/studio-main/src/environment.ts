import { EnvironmentType, EnvironmentTypeV2 } from './env_types';

export const electronEnvironment: EnvironmentType = {
  production: false,
  base_api_url: 'https://py-stage.muzikacoin.io/api',
  env: 'stage',
  infuraAccessToken: 'BHFyoHFDkG2NGioaIlf4',
  rpcUrl: 'https://ropsten.infura.io',
  networkId: 3,
};

export const electronEnvironmentV2: EnvironmentTypeV2 = {
  production: false,
  base_api_url: 'https://py-stage.muzikacoin.io/api',
  env: 'prod',
  protocol: {
    eth: {
      mainNet: {
        rpcUrl: 'https://mainnet.infura.io',
        infuraAccessToken: 'nCLC9iatDyYYhUaFCPkZ',
        networkId: 1
      },
      testNet: {
        rpcUrl: 'https://ropsten.infura.io',
        infuraAccessToken: 'BHFyoHFDkG2NGioaIlf4',
        networkId: 3
      }
    },
    ont: {
      mainNet: {
        rpcUrl: 'http://dappnode1.ont.io',
        port: 20336
      },
      testNet: {
        rpcUrl: 'http://polaris1.ont.io',
        port: 20336
      }
    }
  }
};
