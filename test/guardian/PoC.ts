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

    it.only('Odd tickSpacings result in loss of funds for users', async function () {
            expect(await getTickAtPrice(false)).to.eq(16095);
            expect(await getTickAtPrice(true)).to.eq(16095);

            // Bob mints oneForzero 250-260
            await validateMint({
                signer: hre.props.bob,
                recipient: hre.props.bob.address,
                lower: '250',
                upper: '260',
                amount: tokenAmountBn.mul(1),
                zeroForOne: true,
                balanceInDecrease: tokenAmountBn.mul(1),
                liquidityIncrease: BigNumber.from('202576322463529546796464'),
                upperTickCleared: false,
                lowerTickCleared: true,
                revertMessage: '',
            });

            // Alice mints postion zeroForOne 195-200
            await validateMint({
                signer: hre.props.alice,
                recipient: hre.props.alice.address,
                lower: '195',
                upper: '200',
                amount: tokenAmountBn.mul(1),
                zeroForOne: false,
                balanceInDecrease: tokenAmountBn.mul(1),
                liquidityIncrease: BigNumber.from("396089436751997126922841"),
                balanceOutIncrease: "0",
                upperTickCleared: true,
                lowerTickCleared: false,
                revertMessage: '',
            })

            await validateMint({
                signer: hre.props.bob,
                recipient: hre.props.bob.address,
                lower: '200',
                upper: '250',
                amount: tokenAmountBn.mul(1),
                zeroForOne: false,
                balanceInDecrease: tokenAmountBn.mul(1),
                liquidityIncrease: BigNumber.from("39554511325883907108242"),
                balanceOutIncrease: "0",
                upperTickCleared: true,
                lowerTickCleared: false,
                revertMessage: '',
            })
            expect(await getTickAtPrice(true)) .to.equal(250);
            expect(await getTickAtPrice(false)) .to.equal(250);

            // The swap reverts with an ERC20 token balance underflow, as it attempts to swap within a second range
            // from 200 to 194, meanwhile alice's position spans from 200 to 195. The 194 tick is a result of rounding
            // error in the TickMap._tick function as a result of tickSpacing / 2 being used with an odd tickSpacing.

            // In normal cases the swap would succeed and simply use liquidity from user's positions that are
            // away from the current market price. Therefore, perturbing the accounting system and resulting in
            // loss of assets for these users.
            await validateSwap({
                signer: hre.props.alice,
                recipient: hre.props.alice.address,
                zeroForOne: true,
                amountIn: tokenAmountBn.mul(2),
                priceLimit: minPrice,
                balanceInDecrease: '0',
                balanceOutIncrease: '0',
                revertMessage: 'ERC20: transfer amount exceeds balance',
            });

            // The fix is to prevent odd tickSpaces from being used as they are not compatible with the system.
        });

});