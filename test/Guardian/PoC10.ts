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

it.only("Overwritten Position When Entering Poitions", async function () {

    console.log("Mint #1");

    await validateMint({
        signer: hre.props.bob,
        recipient: hre.props.bob.address,
        lower: '0',
        upper: '100',
        amount: tokenAmountBn.mul(1),
        zeroForOne: true,
        balanceInDecrease: tokenAmountBn.mul(1),
        liquidityIncrease: "20051041647900280328782",
        balanceOutIncrease: "0",
        upperTickCleared: true,
        lowerTickCleared: true,
        revertMessage: '',
    })

    console.log("Mint #2");

    await validateMint({
        signer: hre.props.alice,
        recipient: hre.props.alice.address,
        lower: '9900',
        upper: '10000',
        amount: tokenAmountBn.mul(1),
        zeroForOne: true,
        balanceInDecrease: tokenAmountBn.mul(1),
        liquidityIncrease: "32892884459945451368339",
        balanceOutIncrease: "0",
        upperTickCleared: true,
        lowerTickCleared: true,
        revertMessage: '',
    })

    console.log("BURN #1");

    await validateBurn({
        signer: hre.props.alice,
        lower: '9900',
        upper: '10000',
        claim: '9900',
        liquidityAmount: BigNumber.from("32892884459945451368339"),
        zeroForOne: true,
        balanceInIncrease:   '0',
        balanceOutIncrease: '0',
        lowerTickCleared: false,
        upperTickCleared: false,
        revertMessage: '',
    })
    
    console.log("BURN #2");

    await validateBurn({
        signer: hre.props.alice,
        lower: '9900',
        upper: '10000',
        claim: '9900',
        liquidityAmount: BigNumber.from("32892884459945451368339"),
        zeroForOne: true,
        balanceInIncrease:   '0',
        balanceOutIncrease: '0',
        lowerTickCleared: false,
        upperTickCleared: false,
        revertMessage: 'reverted with panic code 0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)',
    })

    expect(await getPositionLiquidity(true, alice.address, 9900, 10000)).to.eq("32892884459945451368339");

  });
});