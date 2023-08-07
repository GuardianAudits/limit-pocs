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

    // swap(130729655023212559495409942935,7220690858400525128520,false,false)
    // mint(16384,true,10000,550140)

    it("TESTING", async function () {

        await validateMint({
          signer: hre.props.bob,
          recipient: hre.props.bob.address,
          lower: "120",
          upper: "510",
          amount: "847",
          zeroForOne: true,
          balanceInDecrease: "847",
          liquidityIncrease: "44126",
          balanceOutIncrease: "0",
          upperTickCleared: true,
          lowerTickCleared: false,
          revertMessage: "",
        });

        console.log("HERE 1");
    
        await validateMint({
          signer: hre.props.bob,
          recipient: hre.props.bob.address,
          lower: "0",
          upper: "10",
          amount: "1",
          zeroForOne: false,
          balanceInDecrease: "1",
          liquidityIncrease: "44126",
          balanceOutIncrease: "0",
          upperTickCleared: false,
          lowerTickCleared: true,
          revertMessage: "",
        });

        console.log("HERE 2");
    
        await validateMint({
          signer: hre.props.bob,
          recipient: hre.props.bob.address,
          lower: "0",
          upper: "20",
          amount: "1",
          zeroForOne: false,
          balanceInDecrease: "1",
          liquidityIncrease: "44126",
          balanceOutIncrease: "0",
          upperTickCleared: false,
          lowerTickCleared: true,
          revertMessage: "",
        });

        console.log("HERE 3");
    
        await validateBurn({
          signer: hre.props.bob,
          lower: "0",
          upper: "20",
          claim: "20",
          liquidityPercent: ethers.utils.parseUnits("1", 38),
          zeroForOne: false,
          balanceInIncrease: "0",
          balanceOutIncrease: "0",
          lowerTickCleared: true,
          upperTickCleared: false,
          revertMessage: "",
        });

        console.log("HERE 4");
    
        await validateMint({
          signer: hre.props.bob,
          recipient: hre.props.bob.address,
          lower: "-20",
          upper: "107510",
          amount: "504",
          zeroForOne: false,
          balanceInDecrease: "504",
          liquidityIncrease: "44126",
          balanceOutIncrease: "492",
          upperTickCleared: false,
          lowerTickCleared: true,
          revertMessage: "",
        });

        console.log("HERE 5");
    
        await validateMint({
          signer: hre.props.bob,
          recipient: hre.props.bob.address,
          lower: "350",
          upper: "510",
          amount: "707",
          zeroForOne: false,
          balanceInDecrease: "707",
          liquidityIncrease: "44126",
          balanceOutIncrease: "182",
          upperTickCleared: false,
          lowerTickCleared: true,
          revertMessage: "",
        });

        console.log("HERE 6");
    
        await validateBurn({
          signer: hre.props.bob,
          lower: "350",
          upper: "430",
          claim: "430",
          liquidityPercent: ethers.utils.parseUnits("1", 38),
          zeroForOne: false,
          balanceInIncrease: "0",
          balanceOutIncrease: "516",
          lowerTickCleared: true,
          upperTickCleared: false,
          revertMessage: "",
        });

        console.log("HERE 7");

        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: false,
            amountIn: tokenAmountBn.mul(10),
            priceLimit: maxPrice,
            balanceInDecrease: "181",
            balanceOutIncrease: '172',
            revertMessage: '',
        });

      });

      it.only("Pool State Unsaved Leading To Underflow", async function () {

        console.log("Mint #1");

        await validateMint({
          signer: hre.props.bob,
          recipient: hre.props.bob.address,
          lower: "120",
          upper: "510",
          amount: "847",
          zeroForOne: true,
          balanceInDecrease: "847",
          liquidityIncrease: "44126",
          balanceOutIncrease: "0",
          upperTickCleared: false,
          lowerTickCleared: true,
          revertMessage: "",
        });

        console.log("Mint #2");

        await validateMint({
          signer: hre.props.bob,
          recipient: hre.props.bob.address,
          lower: "0",
          upper: "10",
          amount: "1",
          zeroForOne: false,
          balanceInDecrease: "1",
          liquidityIncrease: "1999",
          balanceOutIncrease: "0",
          upperTickCleared: true,
          lowerTickCleared: true,
          revertMessage: "",
        });

        console.log("Mint #3");

        await validateMint({
          signer: hre.props.bob,
          recipient: hre.props.bob.address,
          lower: "0",
          upper: "20",
          amount: "1",
          zeroForOne: false,
          balanceInDecrease: "1",
          liquidityIncrease: "2998",
          balanceOutIncrease: "0",
          upperTickCleared: true,
          lowerTickCleared: true,
          revertMessage: "",
        });

        console.log("Burn #1");

        await validateBurn({
          signer: hre.props.bob,
          lower: "0",
          upper: "20",
          claim: "20",
          liquidityPercent: ethers.utils.parseUnits("1", 38),
          zeroForOne: false,
          balanceInIncrease: "0",
          balanceOutIncrease: "0",
          lowerTickCleared: false,
          upperTickCleared: true,
          revertMessage: "",
        });

        console.log("Mint #4");

        await validateMint({
          signer: hre.props.bob,
          recipient: hre.props.bob.address,
          lower: "-20",
          upper: "107510",
          amount: "504",
          zeroForOne: false,
          balanceInDecrease: "504",
          liquidityIncrease: "44126",
          balanceOutIncrease: "492",
          upperTickCleared: false,
          lowerTickCleared: false,
          revertMessage: "",
        });

        console.log("SWAP #1");

        await validateSwap({
          signer: hre.props.bob,
          recipient: hre.props.bob.address,
          zeroForOne: true,
          amountIn: BigNumber.from("1000000000"),
          priceLimit: BigNumber.from("256"),
          balanceInDecrease: "0",
          balanceOutIncrease: BigNumber.from("0").toString(),
          revertMessage: 'reverted with panic code 0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)',
        });
      });

    it("User cannot claim", async function () {

        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '200',
            upper: '300',
            amount: tokenAmountBn,
            zeroForOne: true,
            balanceInDecrease: tokenAmountBn,
            liquidityIncrease: "20252547841071873106017",
            balanceOutIncrease: "0",
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        })
    
        console.log("Mint #1 Completed");
        console.log();

        await getTickAtPrice(true, true);

        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: false,
            amountIn: tokenAmountBn.div(4),
            priceLimit: maxPrice,
            balanceInDecrease: tokenAmountBn.div(4).toString(),
            balanceOutIncrease: '24475079592580025394',
            revertMessage: '',
        });

        await getTickAtPrice(true, true);

        await validateMint({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            lower: '210',
            upper: '300',
            amount: tokenAmountBn,
            zeroForOne: true,
            balanceInDecrease: tokenAmountBn,
            liquidityIncrease: "22508461518545162760967",
            balanceOutIncrease: "0",
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        })
        await getTickAtPrice(true, true);
        console.log("Mint #2 Completed");
        console.log();

        await validateBurn({
            signer: hre.props.bob,
            lower: '200',
            upper: '300',
            claim: '225',
            liquidityPercent: ethers.utils.parseUnits('0', 38),
            zeroForOne: true,
            balanceInIncrease: '20465286794150111432',
            balanceOutIncrease: '0',
            lowerTickCleared: true,
            upperTickCleared: false,
            revertMessage: '',
        })


      
    });

    it('pool0 - Should undercut twice, advance fill, swap remaining, and burn', async function () {
        // mint position
        const aliceLiquidity = '50252916603475800015887'
        const bobLiquidity = '100757714374312927245661'
        const aliceLiquidity2 = '83587749917909883454638'
        const aliceMinusBobLiquidity = '11692258323234396689338'
        // mint position
        console.log("MINT #1");
        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '100',
            upper: '300',
            amount: tokenAmountBn,
            zeroForOne: true,
            balanceInDecrease: tokenAmountBn,
            liquidityIncrease: "10100959554167425445954",
            balanceOutIncrease: "0",
            upperTickCleared: false,
            lowerTickCleared: true,
            revertMessage: '',
        })
        console.log("MINT #2");

        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '200',
            upper: '2010',
            amount: tokenAmountBn,
            zeroForOne: true,
            balanceInDecrease: tokenAmountBn,
            liquidityIncrease: "1167396864468089343920",
            balanceOutIncrease: "0",
            upperTickCleared: false,
            lowerTickCleared: false,
            revertMessage: '',
        })
        console.log("MINT #3");

        await validateMint({
            signer: hre.props.bob,
            recipient: hre.props.bob.address,
            lower: '1800',
            upper: '2000',
            amount: tokenAmountBn,
            zeroForOne: true,
            balanceInDecrease: tokenAmountBn,
            liquidityIncrease: "10997040322247245433070",
            balanceOutIncrease: "0",
            upperTickCleared: false,
            lowerTickCleared: false,
            revertMessage: '',
        })
        console.log("SWAP #1");

        await validateSwap({
            signer: hre.props.alice,
            recipient: hre.props.alice.address,
            zeroForOne: false,
            amountIn: BigNumber.from("53000000000000000000"),
            priceLimit: maxPrice,
            balanceInDecrease: '53000000000000000000',
            balanceOutIncrease: '52200182531567755825',
            revertMessage: '',
        })

        console.log('Burn #1')

        await validateBurn({
            signer: hre.props.bob,
            lower: '100',
            upper: '300',
            claim: '200',
            liquidityPercent: ethers.utils.parseUnits('10', 37),
            zeroForOne: true,
            balanceInIncrease: '52780627664328889919',
            balanceOutIncrease: '48014806158020726953',
            lowerTickCleared: true,
            upperTickCleared: false,
            revertMessage: '',
        })

        console.log('Burn #2')

        await validateBurn({
            signer: hre.props.bob,
            lower: '1800',
            upper: '2000',
            claim: '1800',
            liquidityPercent: ethers.utils.parseUnits('10', 37),
            zeroForOne: true,
            balanceInIncrease: '0',
            balanceOutIncrease: '99999999999999999999',
            lowerTickCleared: false,
            upperTickCleared: false,
            revertMessage: '',
        })

        console.log('Burn #3')

        await validateBurn({
            signer: hre.props.bob,
            lower: '200',
            upper: '2010',
            claim: '200',
            liquidityPercent: ethers.utils.parseUnits('10', 37),
            zeroForOne: true,
            balanceInIncrease: '219372335671110079',
            balanceOutIncrease: '99785011310411517220',
            lowerTickCleared: true,
            upperTickCleared: false,
            revertMessage: '',
        })

    })
})