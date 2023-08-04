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
        await mintSigners20(hre.props.token0, tokenAmountBn.mul(2), [hre.props.alice, hre.props.bob])

        await mintSigners20(hre.props.token1, tokenAmountBn.mul(2), [hre.props.alice, hre.props.bob])
    })

    it.only("overriding position when burning to the same lower/upper", async function () {

        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '0',
            upper: '200',
            amount: tokenAmountBn,
            zeroForOne: true,
            balanceInDecrease: tokenAmountBn,
            liquidityIncrease: "10050583320695160003177",
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
            lower: '100',
            upper: '200',
            amount: tokenAmountBn,
            zeroForOne: true,
            balanceInDecrease: tokenAmountBn,
            liquidityIncrease: "20151542874862585449132",
            balanceOutIncrease: "0",
            upperTickCleared: false,
            lowerTickCleared: false,
            revertMessage: '',
        })

        console.log("Mint #1 Completed");
        console.log();


        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: false,
            amountIn: BigNumber.from("51000000000000000000"),
            priceLimit: maxPrice,
            balanceInDecrease: '51000000000000000000',
            balanceOutIncrease: '50742541055238885256',
            revertMessage: '',
        })
        console.log("SWAP #1 Completed");
        console.log();

        await validateBurn({
            signer: hre.props.bob,
            lower: '0',
            upper: '200',
            claim: '100',
            liquidityPercent: ethers.utils.parseUnits('0', 36),
            zeroForOne: true,
            balanceInIncrease: '50376233472265442777',
            balanceOutIncrease: '0',
            lowerTickCleared: true,
            upperTickCleared: false,
            revertMessage: '',
        })

        console.log("BURN #1 Completed");
        console.log();

        expect(await getPositionLiquidity(true, bob.address, 100, 200)).to.eq("10050583320695160003177");

        await validateBurn({
            signer: hre.props.bob,
            lower: '100',
            upper: '200',
            claim: '100',
            liquidityPercent: ethers.utils.parseUnits('1', 38),
            zeroForOne: true,
            balanceInIncrease: '207575368007666240',
            balanceOutIncrease: '49669500671783936923',
            lowerTickCleared: true,
            upperTickCleared: false,
            revertMessage: '',
        })

        console.log("BURN #2 Completed");
        console.log();

        // Bobs second position has 0 liquidity
        expect(await getPositionLiquidity(true, bob.address, 100, 200)).to.eq("0");

        await validateBurn({
            signer: hre.props.bob,
            lower: '100',
            upper: '200',
            claim: '100',
            liquidityPercent: ethers.utils.parseUnits('1', 38),
            zeroForOne: true,
            balanceInIncrease: '416191159726890981',
            balanceOutIncrease: '99587958272977177819',
            lowerTickCleared: true,
            upperTickCleared: false,
            revertMessage: "reverted with reason string 'PositionNotFound()'",
        })

        console.log("BURN #3 Completed");

        expect(await hre.props.token0.balanceOf(hre.props.limitPool.address)).eq("99587958272977177821");
        expect(await hre.props.token1.balanceOf(hre.props.limitPool.address)).eq("416191159726890983");
    });
});