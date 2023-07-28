/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { TickMap, TickMapInterface } from "../TickMap";

const _abi = [
  {
    inputs: [],
    name: "BlockIndexOverflow",
    type: "error",
  },
  {
    inputs: [],
    name: "TickIndexBadSpacing",
    type: "error",
  },
  {
    inputs: [],
    name: "TickIndexOverflow",
    type: "error",
  },
  {
    inputs: [],
    name: "TickIndexUnderflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "int24",
        name: "tick",
        type: "int24",
      },
      {
        internalType: "int24",
        name: "tickSpacing",
        type: "int24",
      },
    ],
    name: "getIndices",
    outputs: [
      {
        internalType: "uint256",
        name: "tickIndex",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "wordIndex",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "blockIndex",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];

const _bytecode =
  "0x61038b61003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106100355760003560e01c80638bea96201461003a575b600080fd5b61004d610048366004610221565b61006c565b6040805193845260208401929092529082015260600160405180910390f35b60008080620d89e8600286900b13156100c35760405162461bcd60e51b8152602060048201526014602482015273205469636b496e6465784f766572666c6f77282960601b60448201526064015b60405180910390fd5b620d89e719600286900b12156101125760405162461bcd60e51b81526020600482015260146024820152735469636b496e646578556e646572666c6f77282960601b60448201526064016100ba565b600284810b0560020b8560020b8161012c5761012c610254565b0760020b156101485761014585600286810b5b056101ec565b94505b600284810b0560020b61016c620d89e71960028760020b8161013f5761013f610254565b61017a87600288810b61013f565b0360020b8161018b5761018b610254565b0560020b92505050600881901c601082901c60ff8111156101e55760405162461bcd60e51b8152602060048201526014602482015273426c6f636b496e6465784f766572666c6f77282960601b60448201526064016100ba565b9250925092565b6000816101f98185610280565b61020391906102c8565b9392505050565b8035600281900b811461021c57600080fd5b919050565b6000806040838503121561023457600080fd5b61023d8361020a565b915061024b6020840161020a565b90509250929050565b634e487b7160e01b600052601260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b60008160020b8360020b806102a557634e487b7160e01b600052601260045260246000fd5b627fffff198214600019821416156102bf576102bf61026a565b90059392505050565b60008160020b8360020b627fffff6000821360008413838304851182821616156102f4576102f461026a565b627fffff1960008512828116878305871216156103135761031361026a565b6000871292508582058712848416161561032f5761032f61026a565b858505871281841616156103455761034561026a565b505050929091029594505050505056fea264697066735822122095c54ce6de2054ff7520f3cf15bfdfb157ff21489bbd817e4c6b4e8a1b85708e64736f6c634300080d0033";

export class TickMap__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<TickMap> {
    return super.deploy(overrides || {}) as Promise<TickMap>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): TickMap {
    return super.attach(address) as TickMap;
  }
  connect(signer: Signer): TickMap__factory {
    return super.connect(signer) as TickMap__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TickMapInterface {
    return new utils.Interface(_abi) as TickMapInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TickMap {
    return new Contract(address, _abi, signerOrProvider) as TickMap;
  }
}
