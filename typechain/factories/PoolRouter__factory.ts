/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PoolRouter, PoolRouterInterface } from "../PoolRouter";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_factory",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "factory",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "pools",
        type: "address[]",
      },
      {
        components: [
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint160",
            name: "priceLimit",
            type: "uint160",
          },
          {
            internalType: "uint128",
            name: "amount",
            type: "uint128",
          },
          {
            internalType: "bool",
            name: "exactIn",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "zeroForOne",
            type: "bool",
          },
          {
            internalType: "bytes",
            name: "callbackData",
            type: "bytes",
          },
        ],
        internalType: "struct PoolsharkStructs.SwapParams[]",
        name: "params",
        type: "tuple[]",
      },
    ],
    name: "multiCall",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int256",
        name: "amount0Delta",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "amount1Delta",
        type: "int256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "poolsharkSwapCallback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60a060405234801561001057600080fd5b50604051610ba5380380610ba583398101604081905261002f91610040565b6001600160a01b0316608052610070565b60006020828403121561005257600080fd5b81516001600160a01b038116811461006957600080fd5b9392505050565b608051610b1b61008a600039600060600152610b1b6000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c8063857f5f6f14610046578063c45a01551461005b578063cd5489f11461009e575b600080fd5b61005961005436600461051d565b6100b1565b005b6100827f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b03909116815260200160405180910390f35b6100596100ac36600461080e565b6101ce565b6000336001600160a01b0316630dfe16816040518163ffffffff1660e01b8152600401602060405180830381865afa1580156100f1573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061011591906108d0565b90506000336001600160a01b031663d21220a76040518163ffffffff1660e01b8152600401602060405180830381865afa158015610157573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061017b91906108d0565b9050600061018b848601866108ed565b905060008712156101b25780516101ac9084906101a78a61094f565b610329565b506101c5565b80516101c39083906101a78961094f565b505b50505050505050565b80518251146102245760405162461bcd60e51b815260206004820152601b60248201527f496e70757441727261794c656e677468734d69736d617463682829000000000060448201526064015b60405180910390fd5b60005b825181101561032457604080516020808201835233918290528251908101919091520160405160208183030381529060405282828151811061026b5761026b61096b565b602002602001015160a0018190525082818151811061028c5761028c61096b565b60200260200101516001600160a01b031663e323eb0e8383815181106102b4576102b461096b565b60200260200101516040518263ffffffff1660e01b81526004016102d89190610981565b60408051808303816000875af11580156102f6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061031a9190610a2c565b5050600101610227565b505050565b60006001600160a01b03841661036057813410156103595760405162461bcd60e51b815260040161021b90610a50565b5080610516565b6040516370a0823160e01b815230600482015284906000906001600160a01b038316906370a0823190602401602060405180830381865afa1580156103a9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103cd9190610a98565b6040516323b872dd60e01b81526001600160a01b03878116600483015233602483015260448201879052919250908316906323b872dd906064016020604051808303816000875af1158015610426573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061044a9190610ab1565b5060003d8015610465576020811461046e576000915061047a565b6001915061047a565b60206000803e60005191505b50806104985760405162461bcd60e51b815260040161021b90610a50565b6040516370a0823160e01b81523060048201526000906001600160a01b038916906370a0823190602401602060405180830381865afa1580156104df573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105039190610a98565b905061050f8382610ace565b9450505050505b9392505050565b6000806000806060858703121561053357600080fd5b8435935060208501359250604085013567ffffffffffffffff8082111561055957600080fd5b818701915087601f83011261056d57600080fd5b81358181111561057c57600080fd5b88602082850101111561058e57600080fd5b95989497505060200194505050565b634e487b7160e01b600052604160045260246000fd5b60405160c0810167ffffffffffffffff811182821017156105d6576105d661059d565b60405290565b604051601f8201601f1916810167ffffffffffffffff811182821017156106055761060561059d565b604052919050565b600067ffffffffffffffff8211156106275761062761059d565b5060051b60200190565b6001600160a01b038116811461064657600080fd5b50565b801515811461064657600080fd5b803561066281610649565b919050565b600082601f83011261067857600080fd5b813567ffffffffffffffff8111156106925761069261059d565b6106a5601f8201601f19166020016105dc565b8181528460208386010111156106ba57600080fd5b816020850160208301376000918101602001919091529392505050565b600082601f8301126106e857600080fd5b813560206106fd6106f88361060d565b6105dc565b82815260059290921b8401810191818101908684111561071c57600080fd5b8286015b8481101561080357803567ffffffffffffffff808211156107415760008081fd5b9088019060c0828b03601f190181131561075b5760008081fd5b6107636105b3565b8784013561077081610631565b815260408481013561078181610631565b828a01526060858101356001600160801b03811681146107a15760008081fd5b808385015250608091506107b6828701610657565b9083015260a06107c7868201610657565b838301529285013592848411156107e057600091508182fd5b6107ee8e8b86890101610667565b90830152508652505050918301918301610720565b509695505050505050565b6000806040838503121561082157600080fd5b823567ffffffffffffffff8082111561083957600080fd5b818501915085601f83011261084d57600080fd5b8135602061085d6106f88361060d565b82815260059290921b8401810191818101908984111561087c57600080fd5b948201945b838610156108a357853561089481610631565b82529482019490820190610881565b965050860135925050808211156108b957600080fd5b506108c6858286016106d7565b9150509250929050565b6000602082840312156108e257600080fd5b815161051681610631565b6000602082840312156108ff57600080fd5b6040516020810181811067ffffffffffffffff821117156109225761092261059d565b604052823561093081610631565b81529392505050565b634e487b7160e01b600052601160045260246000fd5b6000600160ff1b820161096457610964610939565b5060000390565b634e487b7160e01b600052603260045260246000fd5b6000602080835260018060a01b0380855116828501528082860151166040850152506001600160801b0360408501511660608401526060840151151560808401526080840151151560a084015260a084015160c08085015280518060e086015260005b81811015610a0157828101840151868201610100015283016109e4565b81811115610a1457600061010083880101525b50601f01601f19169390930161010001949350505050565b60008060408385031215610a3f57600080fd5b505080516020909101519092909150565b60208082526028908201527f5472616e736665724661696c6564286d73672e73656e6465722c206164647265604082015267737328746869732960c01b606082015260800190565b600060208284031215610aaa57600080fd5b5051919050565b600060208284031215610ac357600080fd5b815161051681610649565b600082821015610ae057610ae0610939565b50039056fea2646970667358221220fe835fb89540433f85aa87e1a451528fb8d6578ca210b0854c1e4b462a4f552564736f6c634300080d0033";

export class PoolRouter__factory extends ContractFactory {
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
    _factory: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<PoolRouter> {
    return super.deploy(_factory, overrides || {}) as Promise<PoolRouter>;
  }
  getDeployTransaction(
    _factory: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_factory, overrides || {});
  }
  attach(address: string): PoolRouter {
    return super.attach(address) as PoolRouter;
  }
  connect(signer: Signer): PoolRouter__factory {
    return super.connect(signer) as PoolRouter__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PoolRouterInterface {
    return new utils.Interface(_abi) as PoolRouterInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PoolRouter {
    return new Contract(address, _abi, signerOrProvider) as PoolRouter;
  }
}