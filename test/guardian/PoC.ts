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
    let debugMode           = false
    let balanceCheck        = false
    let deltaMaxBeforeCheck = false
    let deltaMaxAfterCheck  = false
    let latestTickCheck     = false

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

    it.only("Position.remove entered when position is crossed into", async function () {
        
        await validateMint({
          signer: hre.props.bob,
          recipient: hre.props.bob.address,
          lower: "0",
          upper: "100",
          amount: tokenAmountBn,
          zeroForOne: true,
          balanceInDecrease: tokenAmountBn,
          liquidityIncrease: "20051041647900280328782",
          balanceOutIncrease: "0",
          upperTickCleared: false,
          lowerTickCleared: true,
          revertMessage: "",
        });
        console.log("MINT #1 Completed");
        console.log()

        // This mint does not undercut
        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: "10",
            upper: "100",
            amount: tokenAmountBn,
            zeroForOne: true,
            balanceInDecrease: tokenAmountBn,
            liquidityIncrease: "22284509725894501570567",
            balanceOutIncrease: "0",
            upperTickCleared: false,
            lowerTickCleared: false,
            revertMessage: "",
          });
        console.log("MINT #2 Completed");
        console.log()

        await validateBurn({
            signer: hre.props.bob,
            lower: "0",
            upper: "100",
            claim: "0",
            liquidityPercent: ethers.utils.parseUnits('1', 38),
            zeroForOne: true,
            balanceInIncrease: "0",
            balanceOutIncrease: "99999999999999999999",
            lowerTickCleared: true,
            upperTickCleared: false,
            revertMessage: "",
        });
        console.log("BURN #1 Completed");
        console.log()

        await getTickAtPrice(true, true)
        await getTickAtPrice(false, true)

        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: "10",
            upper: "100",
            amount: tokenAmountBn,
            zeroForOne: false,
            balanceInDecrease: tokenAmountBn,
            liquidityIncrease: "24854339507101858495720",
            balanceOutIncrease: "50056247163960588354",
            upperTickCleared: true,
            lowerTickCleared: false,
            revertMessage: "",
          });
        console.log("MINT #3 Completed");
        console.log()
        await getTickAtPrice(true, true)
        await getTickAtPrice(false, true)

       // Claim tick 10 is allowed which causes entry into Positions.remove although position has been partially filled
       // by Mint #3
        await validateBurn({
            signer: hre.props.bob,
            lower: "10",
            upper: "100",
            claim: "10",
            liquidityPercent: ethers.utils.parseUnits('1', 38),
            zeroForOne: true,
            balanceInIncrease: "0",
            balanceOutIncrease: "99999999999999999999",
            lowerTickCleared: false,
            upperTickCleared: false,
            revertMessage: "reverted with reason string 'ERC20: transfer amount exceeds balance'",
        });
        console.log("BURN #2 Completed");

      });

});