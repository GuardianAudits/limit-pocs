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

    it.only("It is possible to have a position shrink to a non-standard tick", async () => {
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

        expect(await getTickAtPrice(false)).to.eq(-887270);
        expect(await getTickAtPrice(true)).to.eq(99);

        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '0',
            upper: '90',
            amount: tokenAmountBn.mul(1),
            zeroForOne: false,
            balanceInDecrease: tokenAmountBn.mul(1),
            liquidityIncrease: BigNumber.from("22173370812928211327045"),
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
            balanceInDecrease: '99551033380443894704',
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

        // Alice has her position shrunk to a non-standard tick as her claim tick is 95
        expect(await getPositionLiquidity(true, alice.address, 95, 100)).to.eq(aliceLiquidity);
    })

});