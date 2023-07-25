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

    it.skip("When there is no swap upon resize users are improperly resized", async () => {
        const bobLiquidity = BigNumber.from("40152271099188026073753");
        const aliceLiquidity = BigNumber.from('18223659436328876602453')

        expect(await getTickAtPrice(false)).to.eq(16095);
        expect(await getTickAtPrice(true)).to.eq(16095);

        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '-10',
            upper: '100',
            amount: tokenAmountBn.mul(1),
            zeroForOne: true,
            balanceInDecrease: tokenAmountBn.mul(1),
            liquidityIncrease: aliceLiquidity,
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        });

        const alicePositionLiquidity = await getPositionLiquidity(true, alice.address, -10, 100);
        expect(alicePositionLiquidity).to.eq(aliceLiquidity);

        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '-100',
            upper: '0',
            expectedUpper: '-50',
            amount: tokenAmountBn.mul(1),
            zeroForOne: false,
            balanceInDecrease: tokenAmountBn.mul(1),
            liquidityIncrease: bobLiquidity,
            balanceOutIncrease: "0",
            upperTickCleared: true,
            lowerTickCleared: false,
            revertMessage: '',
        })

        // Notice that bob is shrunk to -50, however no swap was performed on resize -- this is fine
        // as the pool price was above the midpoint of his position.
        // However, bob was not resized to the market price, he was resized to the midpoint of his position
        // E.g. the priceLimit.
        const bobPositionLiquidity = await getPositionLiquidity(false, bob.address, -100, -50);
        expect(bobPositionLiquidity).to.eq(bobLiquidity);

        // Bob should have been resized to [-10, -100], but he was resized away from the current market price
        // to [-50, -100] and now the current price is at tick -50.
        expect(await getTickAtPrice(false)).to.eq(-50);
        expect(await getTickAtPrice(false)).to.eq(-50);

        // The fix is to resize the position to the current market price when no swap will occur.
        // You can comment out the added section in Positions.sol to see the adjusted resizing.
    })

});