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
import { base58 } from 'ethers/lib/utils'

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

    it.only("Test", async () => {
        const position1Liquidity = '450934779961490414'
        const amountIn1 = "66907882939022685020"

        const position2Liquidity = "0";
        const amountIn2 = "1000977696770293932";

        const position3Liquidity = "363";
        const amountIn3 = "2"

        const position4Liquidity = "0";
        const amountIn4 = "1"

        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '-100000',
            upper: '184550',
            amount: amountIn1,
            zeroForOne: true,
            balanceInDecrease: amountIn1,
            liquidityIncrease: position1Liquidity,
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        });


        expect(await getLiquidity(true)).to.be.equal(position1Liquidity);

        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '-15180',
            upper: '29790',
            amount: amountIn2,
            zeroForOne: false,
            balanceInDecrease: amountIn2,
            balanceOutIncrease: BigNumber.from("66705398633370612078"),
            liquidityIncrease: position2Liquidity,
            upperTickCleared: true,
            lowerTickCleared: false,
            revertMessage: '',
        });

        expect(await getLiquidity(true)).to.be.equal(position1Liquidity);
        expect(await getTickAtPrice(true)).to.equal(16009);

        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '-50',
            upper: '60',
            amount: amountIn3,
            zeroForOne: true,
            balanceInDecrease: amountIn3,
            balanceOutIncrease: BigNumber.from("0"),
            liquidityIncrease: position3Liquidity,
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        });


        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '0',
            upper: '10',
            amount: amountIn4,
            zeroForOne: false,
            balanceInDecrease: amountIn4,
            balanceOutIncrease: BigNumber.from("0"),
            liquidityIncrease: position4Liquidity,
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        });

        console.log("Burning....");

        await validateBurn({
            signer: hre.props.alice,
            lower: '-100000',
            upper: '184550',
            claim: '0',
            liquidityAmount: BigNumber.from("0"),
            zeroForOne: true,
            balanceInIncrease: '447895645676095087',
            balanceOutIncrease: '0',
            lowerTickCleared: true,
            upperTickCleared: true,
            revertMessage: '',
        });

    })

});