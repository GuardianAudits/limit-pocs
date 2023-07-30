/* global describe it before ethers */
const hardhat = require('hardhat')
const { expect } = require('chai')
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber } from 'ethers'
import { mintSigners20 } from '../../utils/token'
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
} from '../../utils/contracts/limitpool'
import { gBefore } from '../../utils/hooks.test'

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

        minPrice = BigNumber.from('4297706460')
        maxPrice = BigNumber.from('1460570142285104104286607650833256105367815198570')
        token0Decimals = await hre.props.token0.decimals()
        token1Decimals = await hre.props.token1.decimals()
        tokenAmountBn = ethers.utils.parseUnits('100', token0Decimals)
        tokenAmount = ethers.utils.parseUnits('200', token0Decimals).toString()
        alice = hre.props.alice
        bob = hre.props.bob
        //carol = hre.props.carol
    })

    this.beforeEach(async function () {
        await mintSigners20(hre.props.token0, tokenAmountBn.mul(10), [hre.props.alice, hre.props.bob])

        await mintSigners20(hre.props.token1, tokenAmountBn.mul(10), [hre.props.alice, hre.props.bob])
    })

    it.only("Negative liquidity", async function () {

        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '0',
            upper: '20',
            amount: BigNumber.from('2'),
            zeroForOne: false,
            balanceInDecrease: BigNumber.from('2'),
            liquidityIncrease: "1999",
            balanceOutIncrease: "0",
            upperTickCleared: true,
            lowerTickCleared: true,
            revertMessage: '',
        })

        console.log("Mint #1 Completed");
        console.log();

        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '-50',
            upper: '60',
            amount: BigNumber.from('2'),
            zeroForOne: true,
            balanceInDecrease: BigNumber.from('2'),
            liquidityIncrease: "0",
            balanceOutIncrease: "1",
            upperTickCleared: true,
            lowerTickCleared: true,
            revertMessage: '',
        })

        console.log("Mint #2 Completed");
        console.log();

        // liquidity is stashed on tick 5 when the tick at the current price is tick 4
        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '-50',
            upper: '60',
            amount: BigNumber.from('2'),
            zeroForOne: false,
            balanceInDecrease: BigNumber.from('2'),
            liquidityIncrease: "363",
            balanceOutIncrease: "0",
            upperTickCleared: true,
            lowerTickCleared: true,
            revertMessage: '',
        })

        console.log("Mint #3 Completed");
        console.log();

        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '-50',
            upper: '60',
            amount: BigNumber.from('2'),
            zeroForOne: false,
            balanceInDecrease: BigNumber.from('2'),
            liquidityIncrease: "363",
            balanceOutIncrease: "0",
            upperTickCleared: true,
            lowerTickCleared: false,
            revertMessage: '',
        })

        console.log("Mint #4 Completed");
        console.log();

        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '-50',
            upper: '60',
            amount: BigNumber.from('2'),
            zeroForOne: true,
            balanceInDecrease: BigNumber.from('2'),
            liquidityIncrease: "0",
            balanceOutIncrease: "2",
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        })

        console.log("Mint #5 Completed");
        console.log();

        // Mint fails here since the pool liquidity underflows
        // liquidityDelta on tick 0 (-1999) exceeds the pool's liquidity
        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '-10000',
            upper: '150',
            amount: BigNumber.from('1000'),
            zeroForOne: true,
            balanceInDecrease: BigNumber.from('1000'),
            liquidityIncrease: "0",
            balanceOutIncrease: "1",
            upperTickCleared: true,
            lowerTickCleared: true,
            revertMessage: 'reverted with panic code 0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)',
        })

        console.log("Mint #6 Completed");
       
      });
})