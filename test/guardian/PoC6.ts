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
describe.only('LimitPool Tests', function () {
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
        carol = hre.props.carol
    })

    this.beforeEach(async function () {
        await mintSigners20(hre.props.token0, tokenAmountBn.mul(10), [hre.props.alice, hre.props.bob])

        await mintSigners20(hre.props.token1, tokenAmountBn.mul(10), [hre.props.alice, hre.props.bob])
    })

    it.only("Can supply any claim tick", async () => {
        const bobLiquidity = BigNumber.from("40152271099188026073753");
        const aliceLiquidity = BigNumber.from('20051041647900280328782')
        const aliceLiquidity2 = BigNumber.from('19951041647900280328782')

        expect(await getTickAtPrice(false)).to.eq(16095);
        expect(await getTickAtPrice(true)).to.eq(16095);

        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '0',
            upper: '100',
            amount: tokenAmountBn.mul(1),
            zeroForOne: true,
            balanceInDecrease: tokenAmountBn.mul(1),
            liquidityIncrease: aliceLiquidity,
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        });

        const alicePositionLiquidity = await getPositionLiquidity(true, alice.address, 0, 100);
        expect(alicePositionLiquidity).to.eq(aliceLiquidity);

        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: false,
            amountIn: tokenAmountBn,
            priceLimit: maxPrice,
            balanceInDecrease: '100000000000000000000',
            balanceOutIncrease: '99503747737971550932',
            revertMessage: '',
        });

        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '0',
            upper: '100',
            expectedUpper: "50",
            amount: tokenAmountBn.mul(1),
            zeroForOne: false,
            balanceInDecrease: tokenAmountBn.mul(1),
            liquidityIncrease: BigNumber.from("39952020798957899520605"),
            upperTickCleared: true,
            lowerTickCleared: false,
            revertMessage: '',
        });

        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: true,
            amountIn: tokenAmountBn.mul(2),
            priceLimit: minPrice,
            balanceInDecrease: '99750324707704631305',
            balanceOutIncrease: '99999999999999999999',
            revertMessage: '',
        });

        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '0',
            upper: '100',
            amount: tokenAmountBn.mul(1),
            zeroForOne: true,
            balanceInDecrease: tokenAmountBn.mul(1),
            liquidityIncrease: aliceLiquidity,
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        });

        await validateBurn({
            signer: hre.props.alice,
            lower: '0',
            upper: '100',
            claim: '95',
            liquidityAmount: BigNumber.from("0"),
            zeroForOne: true,
            balanceInIncrease: '90428477551142091806',
            balanceOutIncrease: '0',
            lowerTickCleared: true,
            upperTickCleared: false,
            revertMessage: '',
        });

        // Alice still has her position shrunk to a non-standard tick
        expect(await getPositionLiquidity(true, alice.address, 95, 100)).to.eq(aliceLiquidity);

        // Swaps the rest of the way to fill the remainder
        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: false,
            amountIn: tokenAmountBn.mul(2),
            priceLimit: maxPrice,
            balanceInDecrease: '101002453924610240701',
            balanceOutIncrease: '100496252262028449066',
            revertMessage: '',
        });

        // Now everyone burns
        await validateBurn({
            signer: hre.props.alice,
            lower: '95',
            upper: '100',
            claim: '100',
            liquidityAmount: BigNumber.from("0"),
            zeroForOne: true,
            balanceInIncrease: '5037004220941189985',
            balanceOutIncrease: '0',
            lowerTickCleared: true,
            upperTickCleared: false,
            revertMessage: '',
        });

        await validateBurn({
            signer: hre.props.alice,
            lower: '0',
            upper: '50',
            claim: '0',
            liquidityAmount: BigNumber.from("0"),
            zeroForOne: false,
            balanceInIncrease: '99750324707704631304',
            balanceOutIncrease: '0',
            lowerTickCleared: true,
            upperTickCleared: true,
            revertMessage: '',
        });

        // Alice has a position that spans 0 ticks but still has liquidity on it
        expect(await getPositionLiquidity(false, alice.address, 0, 0)).to.eq("39952020798957899520605");
        expect((await hre.props.limitPool.pool1()).liquidityGlobal).to.eq("39952020798957899520605")

        expect(await getTickAtPrice(false)).to.eq(-887270);
        expect((await hre.props.limitPool.pool1()).liquidity).to.eq("0")

        expect(await getTickAtPrice(true)).to.eq(887259);
        expect((await hre.props.limitPool.pool0()).liquidity).to.eq("0")

        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '0',
            upper: '100',
            amount: tokenAmountBn.mul(1),
            zeroForOne: false,
            balanceInDecrease: tokenAmountBn.mul(1),
            liquidityIncrease: aliceLiquidity2,
            upperTickCleared: true,
            lowerTickCleared: false,
            revertMessage: '',
        });

        // Burn again, this time removing alice's null position that still has liquidity
        // Alice's liquidity will be subtracted from tick 0's liquidity delta, therefore
        // having more negative liquidityDelta on that tick than the pool.liquidity.
        //
        // Ultimately this will brick the pool with an underflow revert when we reach this tick
        // as we are attempting to subtract more liquidityDelta from the pool.liquidity than exists.
        await validateBurn({
            signer: hre.props.alice,
            lower: '0',
            upper: '0',
            claim: '0',
            liquidityAmount: BigNumber.from("39952020798957899520605"),
            zeroForOne: false,
            balanceInIncrease: '0',
            balanceOutIncrease: '0',
            lowerTickCleared: true,
            upperTickCleared: false,
            revertMessage: '',
        });

        expect((await hre.props.limitPool.pool1()).liquidityGlobal).to.eq("19951041647900280328782");

        // So now we swap to get to these ticks and see that the pool is now bricked past this point
        // This is catastrophic as anyone can create these positions and intentionally put the pool in this
        // bricked state, essentially shutting down the entire protocol and preventing every user from getting filled.
        //
        // Additionally, this state will arise on common day-to-day use, making the pools virtually unusable over a non-trivial
        // amount of time.
        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: true,
            amountIn: tokenAmountBn.mul(2),
            priceLimit: minPrice,
            balanceInDecrease: '101002453924610240701',
            balanceOutIncrease: '100496252262028449066',
            revertMessage: 'reverted with panic code 0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)',
        });


    })

});