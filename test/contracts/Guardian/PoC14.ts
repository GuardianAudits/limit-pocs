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
        await mintSigners20(hre.props.token0, tokenAmountBn.mul(5), [hre.props.alice, hre.props.bob])

        await mintSigners20(hre.props.token1, tokenAmountBn.mul(5), [hre.props.alice, hre.props.bob])
    })

    it.only("Position Minted With 0 Liquidity", async function () {

        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '120',
            upper: '510',
            amount: BigNumber.from('847'),
            zeroForOne: true,
            balanceInDecrease: BigNumber.from('847'),
            liquidityIncrease: "44126",
            balanceOutIncrease: "0",
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        })

        console.log("Mint #1 Completed");
        console.log();

        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '90',
            upper: '510',
            amount: BigNumber.from('545'),
            zeroForOne: false,
            balanceInDecrease: BigNumber.from('545'),
            liquidityIncrease: "0",
            balanceInIncrease: "25000000000000000000",
            balanceOutIncrease: "392",
            upperTickCleared: true,
            lowerTickCleared: false,
            revertMessage: '',
        })

        console.log("Mint #2 Completed");
        console.log();

        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '-90',
            upper: '117730',
            amount: BigNumber.from('526'),
            zeroForOne: false,
            balanceInDecrease: BigNumber.from('526'),
            liquidityIncrease: "0",
            balanceInIncrease: "0",
            balanceOutIncrease: "454",
            upperTickCleared: true,
            lowerTickCleared: false,
            revertMessage: '',
        })

        console.log("Mint #3 Completed");
        console.log();

        expect(await getLiquidity(false, true)).eq("0");
        expect(await getLiquidity(true, true)).eq("0");
    });
});