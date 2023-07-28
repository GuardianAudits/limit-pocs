/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Positions, PositionsInterface } from "../Positions";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "int24",
        name: "lower",
        type: "int24",
      },
      {
        indexed: false,
        internalType: "int24",
        name: "upper",
        type: "int24",
      },
      {
        indexed: false,
        internalType: "int24",
        name: "claim",
        type: "int24",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "zeroForOne",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "liquidityBurned",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "tokenInClaimed",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "tokenOutBurned",
        type: "uint128",
      },
    ],
    name: "BurnLimit",
    type: "event",
  },
];

const _bytecode =
  "0x612d1161003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106100355760003560e01c80633c9e17f61461003a575b600080fd5b61004d61004836600461284a565b6100b5565b6040516100ac919081516001600160a01b031681526020808301516001600160801b03908116918301919091526040808401518216908301526060808401519091169082015260809182015163ffffffff169181019190915260a00190565b60405180910390f35b6040805160a0810182526000808252602082018190529181018290526060810182905260808101919091526100e86124ba565b6100f78989898989898961018d565b60c082015190985091955091501561011457604001519050610182565b60408401516001600160801b03161561014e57836040015181604001516020018181516101419190612928565b6001600160801b03169052505b8060400151602001516001600160801b031660000361017b57604081018051600060809091018190529051525b6040015190505b979650505050505050565b6040805160e081018252600080825260208201819052918101829052606081018290526080810182905260a0810182905260c08101919091526101ce6124ba565b60408051602081019091526000815260006040518061012001604052808881526020018b60008960a0015160020b60020b81526020019081526020016000206040518060400160405290816000820160009054906101000a90046001600160a01b03166001600160a01b03166001600160a01b031681526020016001820160009054906101000a9004600f0b600f0b600f0b8152505081526020018c600089600001516001600160a01b03166001600160a01b031681526020019081526020016000206000896060015160020b60020b81526020019081526020016000206000896080015160020b60020b81526020019081526020016000206040518060a00160405290816000820160009054906101000a90046001600160a01b03166001600160a01b03166001600160a01b031681526020016001820160009054906101000a90046001600160801b03166001600160801b03166001600160801b031681526020016001820160109054906101000a90046001600160801b03166001600160801b03166001600160801b031681526020016002820160009054906101000a90046001600160801b03166001600160801b03166001600160801b031681526020016002820160109054906101000a900463ffffffff1663ffffffff1663ffffffff168152505081526020016103c788606001518861049e565b6001600160a01b031681526020016103e38860a001518861049e565b6001600160a01b031681526020016103ff88608001518861049e565b6001600160a01b0316815260200160001515815260200160001515815260200160001515815250905061043e81604001516020015187604001516107fd565b6001600160801b031660408701528051610460908c908c908c908a868b61090d565b60c081015191975091501561047c578593509150869050610491565b6104878187876112ef565b8694509250879150505b9750975097945050505050565b60008060008460020b126104b5578360020b6104c2565b8360020b6104c290612950565b90506104d183606001516116f6565b62ffffff1681111561051e5760405162461bcd60e51b81526020600482015260116024820152705469636b4f75744f66426f756e6473282960781b60448201526064015b60405180910390fd5b60008160011660000361053557600160801b610547565b6ffffcb933bd6fad37aa2d162d1a5940015b70ffffffffffffffffffffffffffffffffff169050600282161561057b576ffff97272373d413259a46990580e213a0260801c5b600482161561059a576ffff2e50f5f656932ef12357cf3c7fdcc0260801c5b60088216156105b9576fffe5caca7e10e4e61c3624eaa0941cd00260801c5b60108216156105d8576fffcb9843d60f6159c9db58835c9266440260801c5b60208216156105f7576fff973b41fa98c081472e6896dfb254c00260801c5b6040821615610616576fff2ea16466c96a3843ec78b326b528610260801c5b6080821615610635576ffe5dee046a99a2a811c461f1969c30530260801c5b610100821615610655576ffcbe86c7900a88aedcffc83b479aa3a40260801c5b610200821615610675576ff987a7253ac413176f2b074cf7815e540260801c5b610400821615610695576ff3392b0822b70005940c7a398e4b70f30260801c5b6108008216156106b5576fe7159475a2c29b7443b29c7fa6e889d90260801c5b6110008216156106d5576fd097f3bdfd2022b8845ad8f792aa58250260801c5b6120008216156106f5576fa9f746462d870fdf8a65dc1f90e061e50260801c5b614000821615610715576f70d869a156d2a1b890bb3df62baf32f70260801c5b618000821615610735576f31be135f97d08fd981231505542fcfa60260801c5b62010000821615610756576f09aa508b5b7a84e1c677de54f3e99bc90260801c5b62020000821615610776576e5d6af8dedb81196699c329225ee6040260801c5b62040000821615610795576d2216e584f5fa1ea926041bedfe980260801c5b620800008216156107b2576b048a170391f7dc42444e8fa20260801c5b60008560020b13156107d35780600019816107cf576107cf61296c565b0490505b6401000000008106156107e75760016107ea565b60005b60ff16602082901c019250505092915050565b60006f4b3b4ca85a86c47a098a224000000000826001600160801b031611156108685760405162461bcd60e51b815260206004820152601760248201527f496e76616c69644275726e50657263656e7461676528290000000000000000006044820152606401610515565b6001600160801b03831615801561088857506000826001600160801b0316115b156108d55760405162461bcd60e51b815260206004820152601c60248201527f4e6f74456e6f756768506f736974696f6e4c69717569646974792829000000006044820152606401610515565b6f4b3b4ca85a86c47a098a2240000000006108fc6001600160801b03808516908616612982565b61090691906129a1565b9392505050565b6040805160e081018252600080825260208201819052918101829052606081018290526080810182905260a0810182905260c081019190915261094e6124ba565b8360400151602001516001600160801b031685604001516001600160801b031611156109bc5760405162461bcd60e51b815260206004820152601c60248201527f4e6f74456e6f756768506f736974696f6e4c69717569646974792829000000006044820152606401610515565b8360400151602001516001600160801b0316600003610a1d5760405162461bcd60e51b815260206004820152601a60248201527f4e6f506f736974696f6e4c6971756964697479466f756e6428290000000000006044820152606401610515565b6040840151516001600160a01b0316158015610ac057508460c00151610a8157846080015160020b8560a0015160020b148015610a7c575083604001516080015163ffffffff16610a7386608001518986611725565b63ffffffff1611155b610ac0565b846060015160020b8560a0015160020b148015610ac0575083604001516080015163ffffffff16610ab786606001518986611725565b63ffffffff1611155b15610ad5575050600160c083015282826112e3565b846060015160020b8560a0015160020b1280610afe5750846080015160020b8560a0015160020b135b15610b405760405162461bcd60e51b8152602060048201526012602482015271496e76616c6964436c61696d5469636b282960701b6044820152606401610515565b6000610b518660a001518986611725565b90508560c0015115610cca5784608001516001600160a01b031687600001516001600160a01b031610610c3b578460a001516001600160a01b031687600001516001600160a01b031611610bda5786516001600160a01b03166080860181905260c08089015190880151610bc792879190611787565b60020b60a0870152506080860151610c30565b60a0808601516001600160a01b0390811660808089019190915288015160020b918801829052600091825260208b8152604092839020835180850190945280549092168352600190910154600f0b828201528601525b506080860151610ea6565b836060015160010b8660a00151610c5291906129b5565b60020b15610cc5576020850151516001600160a01b0316600003610cb05760405162461bcd60e51b815260206004820152601560248201527457726f6e675469636b436c61696d6564417431282960581b6044820152606401610515565b6020850151516001600160a01b031660808601525b610ea6565b84608001516001600160a01b031687600001516001600160a01b031611610e1c5784606001516001600160a01b031687600001516001600160a01b031610610db55786516001600160a01b03166080860181905260c08089015190880151610d3492879190611787565b60020b60a0870152606084015160c0880151610d539160010b906129b5565b60020b158015610d855750610d6c8760c001518561049e565b6001600160a01b031687600001516001600160a01b0316115b15610daa57836060015160010b8660a001818151610da391906129d7565b60020b9052505b506080860151610c30565b506060848101516001600160a01b0390811660808088019190915291870151600290810b60a089015287830151900b600090815260208b8152604091829020825180840190935280549093168252600190920154600f0b8183015290860152860151610ea6565b836060015160010b8660a00151610e3391906129b5565b60020b15610ea6576020850151516001600160a01b0316600003610e915760405162461bcd60e51b815260206004820152601560248201527457726f6e675469636b436c61696d6564417432282960581b6044820152606401610515565b6020850151516001600160a01b031660808601525b8560c00151610eb9578560600151610ebf565b85608001515b60020b8660a0015160020b03610f2f5784604001516080015163ffffffff168163ffffffff1611610f2a5760405162461bcd60e51b815260206004820152601560248201527457726f6e675469636b436c61696d6564417433282960581b6044820152606401610515565b611058565b60408601516001600160801b0316156110585760008660c00151610f6757610f62898860a001518760600151600061184e565b610f7a565b610f7a898860a0015187606001516119cf565b90508660c00151610f9757866060015160020b8160020b12610fa5565b866080015160020b8160020b135b15610fea5760405162461bcd60e51b815260206004820152601560248201527457726f6e675469636b436c61696d6564417434282960581b6044820152606401610515565b6000610ff7828b88611725565b905086604001516080015163ffffffff168163ffffffff1611156110555760405162461bcd60e51b815260206004820152601560248201527457726f6e675469636b436c61696d6564417435282960581b6044820152606401610515565b50505b856080015160020b8660a0015160020b141580156110845750856060015160020b8660a0015160020b14155b156112515784604001516080015163ffffffff168163ffffffff16116110e45760405162461bcd60e51b815260206004820152601560248201527457726f6e675469636b436c61696d6564417436282960581b6044820152606401610515565b8560c00151156111a25785516001600160a01b0316600090815260208b8152604080832060608a0151600290810b855290835281842060a08b015190910b84529091529020600101546001600160801b03161561119d57600061114d876060015160020b611afe565b61115d8860a0015160020b611afe565b60405160200161116e929190612a4e565b6040516020818303038152906040529061119b5760405162461bcd60e51b81526004016105159190612abb565b505b611251565b85516001600160a01b0316600090815260208b8152604080832060a08a0151600290810b855290835281842060808b015190910b84529091529020600101546001600160801b031615611251576000611201876060015160020b611afe565b6112118860a0015160020b611afe565b604051602001611222929190612a4e565b6040516020818303038152906040529061124f5760405162461bcd60e51b81526004016105159190612abb565b505b60408601516001600160801b031615801561129857508560c0015161128657856080015160020b8660a0015160020b14611298565b856060015160020b8660a0015160020b145b156112db5760405162461bcd60e51b81526020600482015260136024820152724e6f506f736974696f6e55706461746573282960681b6044820152606401610515565b858592509250505b97509795505050505050565b6112f76124ba565b6040840151516001600160a01b0316600003611339578260c00151611320578360a00151611326565b83606001515b60408501516001600160a01b0390911690525b6113606040518060600160405280600060020b815260200160008152602001600081525090565b826060015160010b8460a0015161137791906129b5565b60020b156113aa576113a08460a00151848660c0015188608001516001600160a01b0316611787565b60020b81526113b5565b60a084015160020b81525b80516113c1908461049e565b6001600160a01b0316602082015260c08401516113ee57836080015160020b816000015160020b12611400565b836060015160020b816000015160020b135b156114b3578360c001516114425761143d8560400151602001516001600160801b031682602001518760a001516001600160a01b03166000611b70565b611471565b6114718560400151602001516001600160801b031686606001516001600160a01b031683602001516000611b7e565b85604001516040018181516114869190612aee565b6001600160801b031690525060208101516114a090611b8c565b60408601516001600160a01b0390911690525b60408401516001600160801b031615611649578360c001516114e857806020015185608001516001600160a01b0316106114fd565b806020015185608001516001600160a01b0316115b15611588578360c0015161153b5761153684604001516001600160801b031686608001516001600160a01b031683602001516000611b70565b611566565b61156684604001516001600160801b0316826020015187608001516001600160a01b03166000611b7e565b856040015160400181815161157b9190612aee565b6001600160801b03169052505b8360c0015161159b5783606001516115a1565b83608001515b60020b8460a0015160020b14611649578360c001516115f3576115ee84604001516001600160801b031686606001516001600160a01b031687608001516001600160a01b03166000611b7e565b611627565b61162784604001516001600160801b031686608001516001600160a01b03168760a001516001600160a01b03166000611b70565b856040015160600181815161163c9190612aee565b6001600160801b03169052505b845160a0015161ffff1615801590611672575060008560400151604001516001600160801b0316115b156116ed576000612710866000015160a0015161ffff1687604001516040015161169c9190612b19565b6116a69190612b48565b90508086604001516040018181516116be9190612928565b6001600160801b0316905250855160600180518291906116df908390612aee565b6001600160801b0316905250505b50929392505050565b6000600182900b8061170b620d89e719612b6e565b6117159190612b90565b61171f9190612bca565b92915050565b60008060008060006117378887611ba7565b600081815260038c016020908152604080832085845282528083208684528252909120549498509296509094509250611774906007871690612982565b1c63ffffffff1698975050505050505050565b606083015160009060010b61179c8187612b90565b6117a69190612bca565b90506117b2818561049e565b6001600160a01b031682146118465782156118095760008160020b12806117ea57508060020b60001480156117ea575060008560020b125b156118045760608401516118019060010b82612c57565b90505b611846565b60008160020b138061182c57508060020b600014801561182c575060008560020b135b156118465760608401516118439060010b826129d7565b90505b949350505050565b600060028360010b816118635761186361296c565b0560010b8460020b816118785761187861296c565b0760020b1515806118865750815b80156118a7575061189e620d89e8600185900b611daa565b60020b8460020b125b156118c85760028360010b816118bf576118bf61296c565b0560010b840193505b60008060006118da878760010b611dc1565b600082815260028c0160205260408120549396509194509250600160ff86161b60001901909116908190036119a457600082815260018a8101602052604082205460ff86169190911b6000190116908190036119765789546000196001851b0116600081900361195257899650505050505050611846565b61195b81611f3c565b60ff16600081815260018d0160205260409020549094509150505b61197f81611f3c565b60ff16600884901b179350896002016000858152602001908152602001600020549150505b6119c26119b082611f3c565b60ff16600885901b178860010b611fdf565b9998505050505050505050565b6000806000806119e2868660010b611dc1565b92509250925060008360ff1660ff14611a1757506000828152600288016020526040902054600019600160ff861681011b0119165b80600003611ad45760008260ff1660ff14611a555760018460ff166001016001901b0319896001016000858152602001908152602001600020541690505b80600003611aa657885460001960018581011b0119166000819003611a8257889650505050505050610906565b611a8b81612075565b60ff16600081815260018c0160205260409020549094509150505b611aaf81612075565b60ff16600884901b179350886002016000858152602001908152602001600020549150505b611af2611ae082612075565b60ff16600885901b178760010b611fdf565b98975050505050505050565b606060008212611b1d5760405180602001604052806000815250611b38565b604051806040016040528060018152602001602d60f81b8152505b611b49611b4484612162565b612179565b604051602001611b5a929190612c9f565b6040516020818303038152906040529050919050565b60006118438585858561220c565b60006118438585858561226d565b806001600160a01b0381168114611ba257600080fd5b919050565b600080600080611bba85606001516116f6565b60020b8660020b1315611c055760405162461bcd60e51b81526020600482015260136024820152725469636b496e6465784f766572666c6f77282960681b6044820152606401610515565b611c1285606001516122a7565b60020b8660020b1215611c5e5760405162461bcd60e51b81526020600482015260146024820152735469636b496e646578556e646572666c6f77282960601b6044820152606401610515565b6002856060015160010b81611c7557611c7561296c565b0560010b8660020b81611c8a57611c8a61296c565b0760020b15611cd05760405162461bcd60e51b81526020600482015260126024820152715469636b496e646578496e76616c6964282960701b6044820152606401610515565b6002856060015160010b81611ce757611ce761296c565b0560010b611d13620d89e7196002886060015160010b81611d0a57611d0a61296c565b0560010b611daa565b611d2e886002896060015160010b81611d0a57611d0a61296c565b0360020b81611d3f57611d3f61296c565b0560020b93505050600382901c9050600b82901c601383901c6107fe821115611da15760405162461bcd60e51b8152602060048201526014602482015273426c6f636b496e6465784f766572666c6f77282960601b6044820152606401610515565b92959194509250565b600081611db78185612b90565b6109069190612bca565b60008080620d89e8600286900b1315611e135760405162461bcd60e51b8152602060048201526014602482015273205469636b496e6465784f766572666c6f77282960601b6044820152606401610515565b620d89e719600286900b1215611e625760405162461bcd60e51b81526020600482015260146024820152735469636b496e646578556e646572666c6f77282960601b6044820152606401610515565b600284810b0560020b8560020b81611e7c57611e7c61296c565b0760020b15611e9857611e9585600286810b5b05611daa565b94505b600284810b0560020b611ebc620d89e71960028760020b81611e8f57611e8f61296c565b611eca87600288810b611e8f565b0360020b81611edb57611edb61296c565b0560020b92505050600881901c601082901c60ff811115611f355760405162461bcd60e51b8152602060048201526014602482015273426c6f636b496e6465784f766572666c6f77282960601b6044820152606401610515565b9250925092565b6000808211611f4d57611f4d612cc5565b600160801b8210611f6057608091821c91015b680100000000000000008210611f7857604091821c91015b6401000000008210611f8c57602091821c91015b620100008210611f9e57601091821c91015b6101008210611faf57600891821c91015b60108210611fbf57600491821c91015b60048210611fcf57600291821c91015b60028210611ba257600101919050565b6000611fee620d89e883611daa565b60020260020262ffffff1683111561203e5760405162461bcd60e51b81526020600482015260136024820152725469636b496e6465784f766572666c6f77282960681b6044820152606401610515565b612050620d89e719600284810b611e8f565b60020b60028360020b816120665761206661296c565b0560020b840201905092915050565b600080821161208657612086612cc5565b5060ff6001600160801b038216156120a157607f19016120a9565b608082901c91505b67ffffffffffffffff8216156120c257603f19016120ca565b604082901c91505b63ffffffff8216156120df57601f19016120e7565b602082901c91505b61ffff8216156120fa57600f1901612102565b601082901c91505b60ff821615612114576007190161211c565b600882901c91505b600f82161561212e5760031901612136565b600482901c91505b60038216156121485760011901612150565b600282901c91505b6001821615611ba25760001901919050565b600080821215612175578160000361171f565b5090565b60606000612186836122bc565b600101905060008167ffffffffffffffff8111156121a6576121a6612579565b6040519080825280601f01601f1916602001820160405280156121d0576020820181803683370190505b5090508181016020015b600019016f181899199a1a9b1b9c1cb0b131b232b360811b600a86061a8153600a85049450846121da57509392505050565b60008460000361221e57506000611846565b811561224457611801612238606087901b86860386612394565b85808204910615150190565b83612256606087901b86860386612408565b816122635761226361296c565b0495945050505050565b60008460000361227f57506000611846565b81156122965761180185858503600160601b612394565b61184385858503600160601b612408565b6000600182900b61171581620d89e719612b90565b60008072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b83106122fb5772184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b830492506040015b6d04ee2d6d415b85acef81000000008310612327576d04ee2d6d415b85acef8100000000830492506020015b662386f26fc10000831061234557662386f26fc10000830492506010015b6305f5e100831061235d576305f5e100830492506008015b612710831061237157612710830492506004015b60648310612383576064830492506002015b600a831061171f5760010192915050565b60006123a1848484612408565b905081806123b1576123b161296c565b838509156109065760001981106123fe5760405162461bcd60e51b81526020600482015260116024820152704d617855696e744578636565646564282960781b6044820152606401610515565b6001019392505050565b6000808060001985870985870292508281108382030391505080600003612441576000841161243657600080fd5b508290049050610906565b80841161244d57600080fd5b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150509392505050565b6040805161020081018252600061012082018181526101408301829052610160830182905261018083018290526101a083018290526101c083018290526101e083018290528252825180840190935280835260208381019190915290919082019081526040805160a08101825260008082526020828101829052928201819052606082018190526080820152910190815260006020820181905260408201819052606082018190526080820181905260a0820181905260c09091015290565b634e487b7160e01b600052604160045260246000fd5b60405160e0810167ffffffffffffffff811182821017156125c057634e487b7160e01b600052604160045260246000fd5b60405290565b6040516080810167ffffffffffffffff811182821017156125c057634e487b7160e01b600052604160045260246000fd5b6040805190810167ffffffffffffffff811182821017156125c057634e487b7160e01b600052604160045260246000fd5b6001600160a01b038116811461263d57600080fd5b50565b80356001600160801b0381168114611ba257600080fd5b803561ffff81168114611ba257600080fd5b8035600281900b8114611ba257600080fd5b600060e0828403121561268d57600080fd5b61269561258f565b905081356126a281612628565b81526126b060208301612640565b60208201526126c160408301612640565b60408201526126d260608301612640565b6060820152608082013563ffffffff811681146126ee57600080fd5b60808201526126ff60a08301612657565b60a082015261271060c08301612669565b60c082015292915050565b600060e0828403121561272d57600080fd5b61273561258f565b9050813561274281612628565b8152602082013561275281612628565b602082015261276360408301612640565b604082015261277460608301612669565b606082015261278560808301612669565b608082015261279660a08301612669565b60a082015260c0820135801515811461271057600080fd5b600081830360a08112156127c157600080fd5b6127c96125c6565b915060408112156127d957600080fd5b506127e26125f7565b82356127ed81612628565b815260208301356127fd81612628565b60208201528152604082013561281281612628565b6020820152606082013561282581612628565b60408201526080820135600181900b811461283f57600080fd5b606082015292915050565b60008060008060008060008789036102e081121561286757600080fd5b883597506020808a0135975060408a01359650605f198201121561288a57600080fd5b506040516020810181811067ffffffffffffffff821117156128bc57634e487b7160e01b600052604160045260246000fd5b604052606089013560ff811681146128d357600080fd5b815293506128e48960808a0161267b565b92506128f4896101608a0161271b565b9150612904896102408a016127ae565b905092959891949750929550565b634e487b7160e01b600052601160045260246000fd5b60006001600160801b038381169083168181101561294857612948612912565b039392505050565b6000600160ff1b820161296557612965612912565b5060000390565b634e487b7160e01b600052601260045260246000fd5b600081600019048311821515161561299c5761299c612912565b500290565b6000826129b0576129b061296c565b500490565b60008260020b806129c8576129c861296c565b808360020b0791505092915050565b60008160020b8360020b6000821282627fffff038213811516156129fd576129fd612912565b82627fffff19038212811615612a1557612a15612912565b50019392505050565b60005b83811015612a39578181015183820152602001612a21565b83811115612a48576000848401525b50505050565b750aae0c8c2e8caa0dee6d2e8d2dedc8cd2e4e6e882e8560531b815260008351612a7f816016850160208801612a1e565b61016160f51b6016918401918201528351612aa1816018840160208801612a1e565b602960f81b60189290910191820152601901949350505050565b6020815260008251806020840152612ada816040850160208701612a1e565b601f01601f19169190910160400192915050565b60006001600160801b03808316818516808303821115612b1057612b10612912565b01949350505050565b60006001600160801b0380831681851681830481118215151615612b3f57612b3f612912565b02949350505050565b60006001600160801b0380841680612b6257612b6261296c565b92169190910492915050565b60008160020b627fffff198103612b8757612b87612912565b60000392915050565b60008160020b8360020b80612ba757612ba761296c565b627fffff19821460001982141615612bc157612bc1612912565b90059392505050565b60008160020b8360020b627fffff600082136000841383830485118282161615612bf657612bf6612912565b627fffff196000851282811687830587121615612c1557612c15612912565b60008712925085820587128484161615612c3157612c31612912565b85850587128184161615612c4757612c47612912565b5050509290910295945050505050565b60008160020b8360020b6000811281627fffff1901831281151615612c7e57612c7e612912565b81627fffff018313811615612c9557612c95612912565b5090039392505050565b60008351612cb1818460208801612a1e565b835190830190612b10818360208801612a1e565b634e487b7160e01b600052600160045260246000fdfea26469706673582212202631e20123f4abe0bf361566648facedda119a1a6017301ba87829c1ac3b6fc064736f6c634300080d0033";

export class Positions__factory extends ContractFactory {
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
  ): Promise<Positions> {
    return super.deploy(overrides || {}) as Promise<Positions>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): Positions {
    return super.attach(address) as Positions;
  }
  connect(signer: Signer): Positions__factory {
    return super.connect(signer) as Positions__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PositionsInterface {
    return new utils.Interface(_abi) as PositionsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Positions {
    return new Contract(address, _abi, signerOrProvider) as Positions;
  }
}