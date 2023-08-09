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
    let debugMode = false
    let balanceCheck = false
    let deltaMaxBeforeCheck = false
    let deltaMaxAfterCheck = false
    let latestTickCheck = false

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

        if (debugMode) await getLiquidity(true, true)
        if (debugMode) await getLiquidity(false, true)
    })

    it.only("Unsetting ticks leads to invalid claims", async function () {
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
            lower: "-20",
            upper: "107510",
            expectedUpper: "96880",
            amount: "504",
            zeroForOne: false,
            balanceInDecrease: "504",
            liquidityIncrease: "1",
            balanceOutIncrease: "226",
            upperTickCleared: true,
            lowerTickCleared: false,
            revertMessage: "",
        });

        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: "120",
            upper: "510",
            expectedLower: "320",
            amount: "847",
            zeroForOne: true,
            balanceInDecrease: "847",
            liquidityIncrease: "90923",
            balanceOutIncrease: "125",
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: "",
        });

        // This position should not be allowed to claim & burn a nonzero amount at 320, however they can.
        // This is because the next tick, the end tick for the position tick 10,000 was unset during a prior swap & cross
        // Therefore when doing the claims validation the next tick is the max tick which has an epoch of 0.
        // The solution is to validate the position's end tick epoch in the EpochMap
        // is not greater than the position's epoch as well.
        // The solution is included in Claims.sol
        await validateBurn({
            signer: hre.props.alice,
            lower: "-510",
            upper: "10000",
            claim: "320",
            expectedLower: "320",
            liquidityPercent: BigNumber.from("13516316073012233858115514669384073923"),
            zeroForOne: true,
            balanceInIncrease: "22",
            balanceOutIncrease: "27",
            lowerTickCleared: true,
            upperTickCleared: false,
            revertMessage: "",
        });

        // The effects of the invalid claim are realized
        // The swap attempts to transfer out more than the contract has
        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: false,
            amountIn: BigNumber.from("866"),
            priceLimit: BigNumber.from("34224716871635992872209592711164142668304641091"),
            balanceInDecrease: "125673700234450647049",
            balanceOutIncrease: BigNumber.from("125078101542349866597").toString(),
            revertMessage: "ERC20: transfer amount exceeds balance",
            exactIn: false,
        });
    });
});