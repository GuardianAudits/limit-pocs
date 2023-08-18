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
    })

    it.only("Can claim at the current pool price even when it is not your claim tick", async () => {
        console.log("Mint #1");

        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '-100000',
            upper: '184550',
            amount: BigNumber.from("66907882939022685020"),
            zeroForOne: true,
            balanceInDecrease: BigNumber.from("66907882939022685020"),
            liquidityIncrease: BigNumber.from("450934779961490414"),
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        });

        console.log("Mint #2");

        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '-15180',
            upper: '29790',
            amount: BigNumber.from("1000977696770293932"),
            zeroForOne: false,
            balanceInDecrease: BigNumber.from("1000977696770293932"),
            balanceOutIncrease: BigNumber.from("66705398633370612078"),
            liquidityIncrease: BigNumber.from("0"),
            upperTickCleared: true,
            lowerTickCleared: false,
            revertMessage: '',
        });

        console.log("Mint #3");

        expect(await getTickAtPrice(true)).to.eq(16009);

        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '-50',
            upper: '60',
            amount: BigNumber.from("2"),
            zeroForOne: true,
            balanceInDecrease: BigNumber.from("2"),
            balanceOutIncrease: BigNumber.from("0"),
            liquidityIncrease: BigNumber.from("363"),
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        });

        console.log("Mint #4");

        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '0',
            upper: '10',
            amount: BigNumber.from("1"),
            zeroForOne: false,
            balanceInDecrease: BigNumber.from("1"),
            balanceOutIncrease: BigNumber.from("0"),
            liquidityIncrease: BigNumber.from("0"),
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        });

        expect(await getTickAtPrice(true)).to.eq(0);

        console.log("--------------- Burn #5 ---------------");

        // The issue here is that I was able to claim at the current pool price, even though I should
        // have been claiming at a much higher tick.
        // My liquidity is not active at the current pool price because it was previously stashed on an undercut.
        // Therefore, we will try to subtract my position liquidity from the pool liquidity and encounter an underflow.
        // In this case we got an underflow but in many cases this will lead to immense loss of assets for other users in the pool as
        // I can remove their liquidity from the current pool liquidity, and then they cannot exit as they experience the revert.
        // Among other catastrophic things.
        await validateBurn({
            signer: hre.props.alice,
            lower: '-100000',
            upper: '184550',
            claim: '0', // Claim at current pool price even though my position has been filled at a much higher tick and my liquidity is not active
            liquidityPercent: BigNumber.from("1000000000000000000000000000000000000"),
            zeroForOne: true,
            balanceInIncrease: '447895645676095087',
            balanceOutIncrease: '0',
            lowerTickCleared: true,
            upperTickCleared: true,
            revertMessage: 'reverted with panic code 0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)',
        });

    })


})