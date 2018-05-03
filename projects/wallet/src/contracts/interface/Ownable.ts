/* GENERATED BY TYPECHAIN VER. 0.1.5-remake */
/* tslint:disable */

import * as contract from 'truffle-contract';
import { BigNumber } from 'bignumber.js';
import {
  EtherAddress,
  EtherInteger,
  ITxParams,
  RawAbiDefinition,
  TruffleContract,
  TruffleContractInstance,
  TxValue,
  promisify
} from '../typechain-runtime';
import BuiltContract from '../../../../../muzika-contract/build/contracts/Ownable.json';

export interface IOwnable extends TruffleContractInstance {
  owner(): Promise<string>;

  transferOwnership: {
    (newOwner: EtherAddress, txParams?: ITxParams): Promise<void>;
    sendTransaction: (
      newOwner: EtherAddress,
      txParams?: ITxParams
    ) => Promise<void>;
    call: (newOwner: EtherAddress, txParams?: ITxParams) => Promise<void>;
    request: (newOwner: EtherAddress) => Promise<string>;
    estimateGas: (newOwner: EtherAddress) => Promise<number>;
  };
}

export const TruffleOwnable: () => TruffleContract<IOwnable> = () =>
  contract(BuiltContract);
