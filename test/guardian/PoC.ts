/* global describe it before ethers */
const hardhat = require('hardhat')
const { expect } = require('chai')
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber } from 'ethers'
import { mintSigners20 } from '../utils/token'
import {
    BN_ZERO,
    PoolState,
    getLiquidity,
    getPositionLiquidity,
    getPrice,
    getSwapEpoch,
    getTick,
    getTickAtPrice,
    validateBurn,
    validateMint,
    validateSwap
} from '../utils/contracts/limitpool'
import { gBefore } from '../utils/hooks.test'
import { base58 } from 'ethers/lib/utils'

alice: SignerWithAddress
describe('LimitPool Tests', function () {
    let tokenAmount: string
    let tokenAmountBn: BigNumber
    let token0Decimals: number
    let token1Decimals: number
    let minPrice: BigNumber
    let maxPrice: BigNumber

    let alice: SignerWithAddress
    let bob: SignerWithAddress
    let carol: SignerWithAddress

    const liquidityAmount = BigNumber.from('20051041647900280328782')
    const minTickIdx = BigNumber.from('-887272')
    const maxTickIdx = BigNumber.from('887272')

    ////////// DEBUG FLAGS //////////
    let debugMode           = false
    let balanceCheck        = false
    let deltaMaxBeforeCheck = false
    let deltaMaxAfterCheck  = false
    let latestTickCheck     = false

    //every test should clear out all liquidity

    before(async function () {
        await gBefore()
        let currentBlock = await ethers.provider.getBlockNumber()
        const pool0: PoolState = await hre.props.limitPool.pool0()
        const liquidity = pool0.liquidity
        const globalState = await hre.props.limitPool.globalState()
        const price = pool0.price

        expect(liquidity).to.be.equal(BN_ZERO)

        minPrice = BigNumber.from('0')
        maxPrice = BigNumber.from('1461501637330902918203684832716283019655932542975')
        token0Decimals = await hre.props.token0.decimals()
        token1Decimals = await hre.props.token1.decimals()
        tokenAmountBn = ethers.utils.parseUnits('100', token0Decimals)
        tokenAmount = ethers.utils.parseUnits('100', token0Decimals).toString()
        alice = hre.props.alice
        bob = hre.props.bob
        carol = hre.props.carol
    })

    this.beforeEach(async function () {
        await mintSigners20(hre.props.token0, tokenAmountBn.mul(10), [hre.props.alice, hre.props.bob])

        await mintSigners20(hre.props.token1, tokenAmountBn.mul(10), [hre.props.alice, hre.props.bob])
    })

    it.only("_iterate does not unlock liquidity from the halfTick leading to liquidity underflow", async function () {
        
        await validateMint({
          signer: hre.props.bob,
          recipient: hre.props.bob.address,
          lower: "0",
          upper: "10",
          amount: "20",
          zeroForOne: false,
          balanceInDecrease: "20",
          liquidityIncrease: "39992",
          balanceOutIncrease: "0",
          upperTickCleared: true,
          lowerTickCleared: true,
          revertMessage: "",
        });

        console.log("MINT #1 Completed");
        console.log()
    
        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: "0",
            upper: "10",
            amount: "20",
            zeroForOne: true,
            balanceInDecrease:  "20",
            liquidityIncrease: "0",
            balanceOutIncrease: "12",
            upperTickCleared: false,
            lowerTickCleared: false,
            revertMessage: "",
          });

        console.log("MINT #2 Completed");
        console.log()
    
        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: "0",
            upper: "10",
            amount: "20",
            zeroForOne: false,
            balanceInDecrease:  "20",
            liquidityIncrease: "39992",
            balanceOutIncrease: "0",
            upperTickCleared: true,
            lowerTickCleared: false,
            revertMessage: "",
          });

        console.log("MINT #3 Completed");
        console.log()
    
        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: "0",
            upper: "20",
            amount: "20",
            zeroForOne: true,
            balanceInDecrease:  "20",
            liquidityIncrease: "36028",
            balanceOutIncrease: "2",
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: "",
          });
        console.log("MINT #4 Completed");
        console.log()
    
        await validateBurn({
            signer: hre.props.bob,
            lower: "10",
            upper: "20",
            claim: "10",
            liquidityPercent: ethers.utils.parseUnits('1', 38),
            zeroForOne: true,
            balanceInIncrease: "0",
            balanceOutIncrease: "17",
            lowerTickCleared: true,
            upperTickCleared: false,
            revertMessage: "",
        });
        console.log("BURN #1 Completed");
        console.log()
    
        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: false,
            amountIn: BigNumber.from("26"),
            priceLimit: maxPrice,
            balanceInDecrease: '9',
            balanceOutIncrease: '7',
            revertMessage: '',
        })
        console.log("SWAP #1 Completed");
        console.log()
    
        // Swap reverts with underflow 
        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: true,
            amountIn: BigNumber.from("207384318602420766392973380627479492219"),
            priceLimit: minPrice,
            balanceInDecrease: '3',
            balanceOutIncrease: '2',
            revertMessage: '',
        })
    }); 

});