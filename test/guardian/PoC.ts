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

    it.only("Shared TickMap leads to ticks errantly unset", async function () {
        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: "-510",
            upper: "10000",
            amount: "227",
            zeroForOne: true,
            balanceInDecrease: "227",
            liquidityIncrease: "541",
            balanceOutIncrease: "0",
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: "",
        });

        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: "10",
            upper: "107500",
            expectedUpper: "93720",
            amount: "10000000000000000",
            zeroForOne: false,
            balanceInDecrease: "10000000000000000",
            liquidityIncrease: "93116165100287",
            balanceOutIncrease: "226",
            upperTickCleared: true,
            lowerTickCleared: false,
            revertMessage: "",
        });

        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: "-510",
            upper: "10000",
            amount: "227",
            zeroForOne: false,
            balanceInDecrease: "227",
            liquidityIncrease: "336",
            balanceOutIncrease: "0",
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: "",
        });

        // When we do this zeroForOne burn we check if ticks0 has any liquidityDelta on tick 10,000
        // before we clear it. There is 0 liquidityDelta on ticks0 tick 10,000, so it is cleared.
        // However, there is nonzero liquidityDelta on tick 10,000 in ticks1 -- this liquidityDelta needs to be applied
        // upon crossing during a swap, however tick 10,000 can never be the cross tick as it is no longer set
        // in the TickMap.
        await validateBurn({
            signer: hre.props.alice,
            lower: "-510",
            upper: "10000",
            claim: "10000",
            liquidityPercent: BigNumber.from("3619953732483784731740789722613948214"),
            zeroForOne: true,
            balanceInIncrease: "364",
            positionLiquidityChange: "541",
            balanceOutIncrease: "0",
            lowerTickCleared: true,
            upperTickCleared: true,
            revertMessage: "",
        });

        // When we do a swap we never cross tick 10,000 as it was unset in the TickMap.
        // Leading to liquidity never getting kicked in and the accounting system becoming invalidated.
        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: true,
            amountIn: BigNumber.from("340282366920938463463374607431768211452"),
            priceLimit: BigNumber.from("12"),
            balanceInDecrease: "125673700234450647049",
            balanceOutIncrease: BigNumber.from("125078101542349866597").toString(),
            revertMessage: "reverted with panic code 0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)",
        });

        // The resolution ought to be to adopt two TickMaps & EpochMaps to both solve this and
        // avoid any potential logical errors related to sharing a TickMap & EpochMap in the future.
    });

});