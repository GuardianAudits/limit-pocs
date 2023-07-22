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

    it.only('pool.price not updated when the pool.tickAtPrice is not a multiple of the tick spacing', async function () {
        const aliceLiquidity = '20051041647900280328782'

        // Get the pool1 tickAtPrice to not be an even multiple of the tick spacing

        // Check that I've set the pool tick to tick 15
        const poolPrice = await getPrice(false);
        expect(poolPrice).to.eq('79287602951555555546117890672');

        let pool1Tick = await getTickAtPrice(false);
        expect(pool1Tick).to.eq(15);

        let pool0Tick = await getTickAtPrice(true);
        expect(pool0Tick).to.eq(15);

        // Mint a position and undercut the price such that we get resized
        // Resulting in more liquidity being swapped in a tick range than exists
        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '0',
            upper: '100',
            amount: tokenAmountBn,
            zeroForOne: true,
            balanceInDecrease: tokenAmountBn,
            liquidityIncrease: aliceLiquidity,
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        })

        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: false,
            amountIn: tokenAmountBn.div(5),
            priceLimit: maxPrice,
            balanceInDecrease: '20000000000000000000',
            balanceOutIncrease: '19980070790195293837',
            revertMessage: '',
        })

        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '0',
            upper: '100',
            amount: tokenAmountBn,
            zeroForOne: true,
            balanceInDecrease: tokenAmountBn,
            liquidityIncrease: aliceLiquidity,
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        })

        await validateBurn({
            signer: hre.props.bob,
            lower: '0',
            upper: '100',
            claim: '0',
            liquidityPercent: ethers.utils.parseUnits('1', 38),
            zeroForOne: true,
            balanceInIncrease: '0',
            balanceOutIncrease: '99999999999999999999',
            lowerTickCleared: true,
            upperTickCleared: false,
            revertMessage: '',
        })

        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '0',
            upper: '100',
            expectedUpper: '50',
            amount: tokenAmountBn,
            zeroForOne: false,
            balanceInDecrease: tokenAmountBn,
            balanceOutIncrease: "50062496842661136959", // 30082426052465843121 should be the amount out increase
            liquidityIncrease: "19900979151057619191667", // 27891383310849199095788 should be the liquidity increase
            upperTickCleared: true,
            lowerTickCleared: false,
            revertMessage: '',
        })

        // Now everyone else tries to burn
        await validateBurn({
            signer: hre.props.bob,
            lower: '0',
            upper: '50',
            claim: '50',
            liquidityPercent: ethers.utils.parseUnits('1', 38),
            zeroForOne: false,
            balanceInIncrease: '0',
            balanceOutIncrease: '49812196612534583810',
            lowerTickCleared: false,
            upperTickCleared: true,
            revertMessage: '',
        })

        // Alice attempts to burn, however she cannot as there are not enough tokens in the contract
        // These tokens were stolen because the pool.price was not updated accordingly in the Ticks.unlock function
        // Therefore the resulting amountMax in quoteSingle is much larger than it should be, and users are able
        // to swap much more than they ought to be able to within a given tick range.
        await validateBurn({
            signer: hre.props.alice,
            lower: '0',
            upper: '100',
            claim: '40',
            liquidityPercent: ethers.utils.parseUnits('1', 38),
            zeroForOne: true,
            balanceInIncrease: '50187803387465416188',
            balanceOutIncrease: '49937503157338863040',
            lowerTickCleared: true,
            upperTickCleared: false,
            revertMessage: 'ERC20: transfer amount exceeds balance',
        })

        // The fix is to move the ticks[pool.tickAtPrice] = ILimitPoolStructs.Tick(0,0); line to the end of
        // the Ticks.unlock function, this way the pool.price is able to update as the priceAt will not always be 0.
    });

});