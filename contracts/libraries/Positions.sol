// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.13;

import '../interfaces/modules/curves/ICurveMath.sol';
import './Ticks.sol';
import '../interfaces/ILimitPoolStructs.sol';
import './math/OverflowMath.sol';
import '../interfaces/modules/curves/ICurveMath.sol';
import './Claims.sol';
import './EpochMap.sol';
import './utils/SafeCast.sol';
import './pool/SwapCall.sol';

/// @notice Position management library for ranged liquidity.
library Positions {
    uint256 internal constant Q96 = 0x1000000000000000000000000;

    using SafeCast for uint256;

    event BurnLimit(
        address indexed to,
        int24 lower,
        int24 upper,
        int24 claim,
        bool zeroForOne,
        uint128 liquidityBurned,
        uint128 tokenInClaimed,
        uint128 tokenOutBurned
    );

    function resize(
        ILimitPoolStructs.MintParams memory params,
        ILimitPoolStructs.MintCache memory cache,
        ILimitPoolStructs.TickMap storage tickMap,
        mapping(int24 => ILimitPoolStructs.Tick) storage swapTicks
    ) internal returns (
        ILimitPoolStructs.MintParams memory,
        ILimitPoolStructs.MintCache memory
    )
    {
        ConstantProduct.checkTicks(params.lower, params.upper, cache.constants.tickSpacing);

        cache.priceLower = ConstantProduct.getPriceAtTick(params.lower, cache.constants);
        cache.priceUpper = ConstantProduct.getPriceAtTick(params.upper, cache.constants);

        // cannot mint empty position
        if (params.amount == 0) require (false, 'PositionAmountZero()');

        // calculate L constant
        cache.liquidityMinted = ConstantProduct.getLiquidityForAmounts(
            cache.priceLower,
            cache.priceUpper,
            params.zeroForOne ? cache.priceLower : cache.priceUpper,
            params.zeroForOne ? 0 : uint256(params.amount),
            params.zeroForOne ? uint256(params.amount) : 0
        );
        // |||||       |           |
        // 0           50         100
        // if position is one spacing wide, push all the end to end of tick spacing
        // if tickspacing is more than one spacing wide, 
        {
            cache.priceLimit = params.zeroForOne ? ConstantProduct.getNewPrice(cache.priceUpper, cache.liquidityMinted, params.amount / 2, true, true)
                                                 : ConstantProduct.getNewPrice(cache.priceLower, cache.liquidityMinted, params.amount / 2, false, true);
            // get tick at price
            cache.tickLimit = ConstantProduct.getTickAtPrice(cache.priceLimit.toUint160(), cache.constants);
            // round to nearest tick spacing
            cache.priceLimit = ConstantProduct.getPriceAtTick(cache.tickLimit, cache.constants);
        }

        ILimitPoolStructs.SwapCache memory swapCache;
        swapCache.pool = cache.swapPool;
        swapCache.state = cache.state;
        swapCache.constants = cache.constants;

        // sync up pool epochs for position epoch stamping
        if (cache.pool.swapEpoch < cache.swapPool.swapEpoch)
            cache.pool.swapEpoch = cache.swapPool.swapEpoch;
        else if (cache.swapPool.swapEpoch < cache.pool.swapEpoch)
            cache.swapPool.swapEpoch = cache.pool.swapEpoch;

        // only swap if priceLimit is beyond current pool price
        if (params.zeroForOne ? cache.priceLimit < cache.swapPool.price
                              : cache.priceLimit > cache.swapPool.price) {
            // swap and save the pool state
            (cache.swapPool, swapCache) = Ticks.swap(
                swapTicks,
                tickMap,
                ILimitPoolStructs.SwapParams({
                    to: params.to,
                    priceLimit: cache.priceLimit.toUint160(),
                    amount: params.amount,
                    //TODO: handle exactOut
                    exactIn: true,
                    zeroForOne: params.zeroForOne,
                    callbackData: abi.encodePacked(bytes1(0x0))
                }),
                swapCache,
                cache.swapPool
            );
            // subtract from remaining input amount
            params.amount -= uint128(swapCache.input);
        }
        // move start tick based on amount filled in swap
        //TODO: skip if minAmountMinted
        if ((params.amount > 0 && swapCache.input > 0) ||
            (params.zeroForOne ? cache.priceLower < cache.swapPool.price
                               : cache.priceUpper > cache.swapPool.price)
        ) {
            // if (params.amount > 0 && swapCache.input > 0) {
                // round ahead tickLimit to avoid crossing epochs
                cache.tickLimit = TickMap.roundAheadWithPrice(cache.tickLimit, cache.constants, !params.zeroForOne, cache.priceLimit);
                if (params.zeroForOne) {
                    if (params.lower < cache.tickLimit) {
                        // if rounding goes past limit trim position
                        /// @dev - if swap didn't go to limit user would be 100% filled
                        params.lower = cache.tickLimit;
                        cache.priceLower = ConstantProduct.getPriceAtTick(params.lower, cache.constants);
                    }
                    if (params.lower == params.upper && params.upper < ConstantProduct.maxTick(cache.constants.tickSpacing)) {
                        params.upper += cache.constants.tickSpacing;
                    }
                    cache.priceUpper = ConstantProduct.getPriceAtTick(params.upper, cache.constants);
                } else {
                    if (params.upper > cache.tickLimit) {
                        // if rounding goes past limit trim position
                        params.upper = cache.tickLimit;
                        cache.priceUpper = ConstantProduct.getPriceAtTick(params.upper, cache.constants);
                    }
                    if (params.upper == params.lower && params.lower > ConstantProduct.minTick(cache.constants.tickSpacing)) {
                        params.lower -= cache.constants.tickSpacing;
                    }
                    cache.priceLower = ConstantProduct.getPriceAtTick(params.lower, cache.constants);
                }
            // }
            if (params.amount > 0 && params.lower < params.upper)
                cache.liquidityMinted = ConstantProduct.getLiquidityForAmounts(
                    cache.priceLower,
                    cache.priceUpper,
                    params.zeroForOne ? cache.priceLower : cache.priceUpper,
                    params.zeroForOne ? 0 : uint256(params.amount),
                    params.zeroForOne ? uint256(params.amount) : 0
                );
            else
                /// @auditor unnecessary since params.amount is 0
                cache.liquidityMinted = 0;
            cache.pool.swapEpoch += 1;
        }
        // save swapCache
        cache.swapCache = swapCache;

        return (
            params,
            cache
        );
    }

    function add(
        ILimitPoolStructs.MintCache memory cache,
        mapping(int24 => ILimitPoolStructs.Tick) storage ticks,
        ILimitPoolStructs.TickMap storage tickMap,
        ILimitPoolStructs.MintParams memory params
    ) internal returns (
        ILimitPoolStructs.PoolState memory,
        ILimitPoolStructs.Position memory
    ) {
        if (cache.liquidityMinted == 0) return (cache.pool, cache.position);

        if (cache.position.liquidity == 0) {
            cache.position.epochLast = cache.pool.swapEpoch;
        } else {
            // safety check in case we somehow get here
            if (
                params.zeroForOne
                    ? EpochMap.get(params.lower, tickMap, cache.constants)
                            > cache.position.epochLast
                    : EpochMap.get(params.upper, tickMap, cache.constants)
                            > cache.position.epochLast
            ) {
                require (false, string.concat('UpdatePositionFirstAt(', String.from(params.lower), ', ', String.from(params.upper), ')'));
            }
            /// @auditor maybe this shouldn't be a revert but rather just not mint the position?
        }
        
        // add liquidity to ticks
        Ticks.insert(
            ticks,
            tickMap,
            cache,
            params
        );

        // update liquidity global
        cache.pool.liquidityGlobal += uint128(cache.liquidityMinted);

        cache.position.liquidity += uint128(cache.liquidityMinted);

        return (cache.pool, cache.position);
    }

    function remove(
        mapping(address => mapping(int24 => mapping(int24 => ILimitPoolStructs.Position)))
            storage positions,
        mapping(int24 => ILimitPoolStructs.Tick) storage ticks,
        ILimitPoolStructs.TickMap storage tickMap,
        ILimitPoolStructs.PoolState memory pool,
        ILimitPoolStructs.UpdateParams memory params,
        ILimitPoolStructs.Immutables memory constants
    ) internal returns (uint128, ILimitPoolStructs.PoolState memory) {
        // validate burn percentage
        if (params.amount > 1e38) require (false, 'InvalidBurnPercentage()');
        // initialize cache
        ILimitPoolStructs.UpdateCache memory cache;
        cache.position = positions[msg.sender][params.lower][params.upper];
        cache.priceLower = ConstantProduct.getPriceAtTick(params.lower, constants);
        cache.priceUpper = ConstantProduct.getPriceAtTick(params.upper, constants);
        cache.removeLower = true; cache.removeUpper = true;

        // convert percentage to liquidity amount
        params.amount = _convert(cache.position.liquidity, params.amount);

        // early return if no liquidity to remove
        if (params.amount == 0) return (0, pool);
        if (params.amount > cache.position.liquidity) {
            require (false, 'NotEnoughPositionLiquidity()');
        } else {
            /// @dev - validate needed in case user passes in wrong tick
            if (params.zeroForOne) {
                if (EpochMap.get(params.lower, tickMap, constants)
                            > cache.position.epochLast) {
                    int24 nextTick = TickMap.next(tickMap, params.lower, constants.tickSpacing);
                    if (pool.price > cache.priceLower ||
                        EpochMap.get(nextTick, tickMap, constants)
                            > cache.position.epochLast) {
                        require (false, 'WrongTickClaimedAt()');            
                    }
                    if (pool.price == cache.priceLower) {
                        pool.liquidity -= params.amount;
                    }
                }
                // if pool price is further along
                // OR next tick has a greater epoch
            } else {
                if (EpochMap.get(params.upper, tickMap, constants)
                            > cache.position.epochLast) {
                    int24 previousTick = TickMap.previous(tickMap, params.upper, constants.tickSpacing, false);
                    if (pool.price < cache.priceUpper ||
                        EpochMap.get(previousTick, tickMap, constants)
                            > cache.position.epochLast) {
                        require (false, 'WrongTickClaimedAt()');            
                    }
                    if (pool.price == cache.priceUpper) {
                        pool.liquidity -= params.amount;
                    }
                }
            }
        }

        Ticks.remove(
            ticks,
            tickMap,
            cache,
            params,
            constants
        );

        // update liquidity global
        pool.liquidityGlobal -= params.amount;

        {
            // update max deltas
            ILimitPoolStructs.Tick memory finalTick = ticks[params.zeroForOne ? params.lower : params.upper];
            ticks[params.zeroForOne ? params.lower : params.upper] = finalTick;
        }

        cache.position.amountOut += uint128(
            params.zeroForOne
                ? ConstantProduct.getDx(params.amount, cache.priceLower, cache.priceUpper, false)
                : ConstantProduct.getDy(params.amount, cache.priceLower, cache.priceUpper, false)
        );

        cache.position.liquidity -= uint128(params.amount);
        positions[msg.sender][params.lower][params.upper] = cache.position;

        if (params.amount > 0) {
            emit BurnLimit(
                    params.to,
                    params.lower,
                    params.upper,
                    params.zeroForOne ? params.lower : params.upper,
                    params.zeroForOne,
                    params.amount,
                    0,
                    cache.position.amountOut
            );
        }
        return (params.amount, pool);
    }

    function update(
        mapping(address => mapping(int24 => mapping(int24 => ILimitPoolStructs.Position)))
            storage positions,
        mapping(int24 => ILimitPoolStructs.Tick) storage ticks,
        ILimitPoolStructs.TickMap storage tickMap,
        ILimitPoolStructs.GlobalState memory state,
        ILimitPoolStructs.PoolState memory pool,
        ILimitPoolStructs.UpdateParams memory params,
        ILimitPoolStructs.Immutables memory constants
    ) internal returns (
        ILimitPoolStructs.GlobalState memory,
        ILimitPoolStructs.PoolState memory,
        int24
    )
    {
        ILimitPoolStructs.UpdateCache memory cache;
        (
            params,
            cache,
            state
        ) = _deltas(
            positions,
            ticks,
            tickMap,
            state,
            pool,
            params,
            constants
        );

        if (cache.earlyReturn)
            return (state, pool, params.claim);
        
        // update pool liquidity
        if (params.zeroForOne ? (cache.priceLower <= pool.price && cache.priceUpper > pool.price)
                              : (cache.priceLower < pool.price && cache.priceUpper >= pool.price))
            pool.liquidity -= params.amount;
        
        if (params.amount > 0) {
            if (params.claim == (params.zeroForOne ? params.upper : params.lower)) {
                // only remove once if final tick of position
                cache.removeLower = false;
                cache.removeUpper = false;
            } else {
                params.zeroForOne ? cache.removeUpper = true 
                                  : cache.removeLower = true;
            }
            if (params.zeroForOne) {
                if (params.claim == params.lower && 
                    cache.pool.price < cache.priceLower
                ) {
                    cache.removeLower = true;
                } else if (params.claim % constants.tickSpacing != 0 && 
                    cache.pool.price < cache.priceClaim)
                    cache.removeLower = true;
            } else {
                if (params.claim == params.upper &&
                    cache.pool.price > cache.priceUpper
                )
                    cache.removeUpper = true;
                else if (params.claim % constants.tickSpacing != 0 &&
                            cache.pool.price > cache.priceClaim)
                    cache.removeUpper = true;
            }
            Ticks.remove(
                ticks,
                tickMap,
                cache,
                params,
                constants
            );
            // update position liquidity
            cache.position.liquidity -= uint128(params.amount);
            // update global liquidity
            pool.liquidityGlobal -= params.amount;
        }
        // clear out old position
        if (params.zeroForOne ? params.claim != params.lower 
                              : params.claim != params.upper) {
            
            /// @dev - this also clears out position end claims
            if (params.zeroForOne ? params.claim == params.lower 
                                  : params.claim == params.upper) {
                // subtract remaining position liquidity out from global
                pool.liquidityGlobal -= cache.position.liquidity;
            }
            delete positions[msg.sender][params.lower][params.upper];
        }
        // force collection to the user
        // store cached position in memory
        if (cache.position.liquidity == 0) {
            cache.position.epochLast = 0;
            cache.position.claimPriceLast = 0;
        }
        params.zeroForOne
            ? positions[msg.sender][params.claim][params.upper] = cache.position
            : positions[msg.sender][params.lower][params.claim] = cache.position;
        
        emit BurnLimit(
            params.to,
            params.lower,
            params.upper,
            params.claim,
            params.zeroForOne,
            params.amount,
            cache.position.amountIn,
            cache.position.amountOut
        );
        // return cached position in memory and transfer out
        return (state, pool, params.claim);
    }

    function snapshot(
        mapping(address => mapping(int24 => mapping(int24 => ILimitPoolStructs.Position)))
            storage positions,
        mapping(int24 => ILimitPoolStructs.Tick) storage ticks,
        ILimitPoolStructs.TickMap storage tickMap,
        ILimitPoolStructs.GlobalState memory state,
        ILimitPoolStructs.PoolState memory pool,
        ILimitPoolStructs.UpdateParams memory params,
        ILimitPoolStructs.Immutables memory constants
    ) external view returns (
        ILimitPoolStructs.Position memory
    ) {
        ILimitPoolStructs.UpdateCache memory cache;
        (
            params,
            cache,
            state
        ) = _deltas(
            positions,
            ticks,
            tickMap,
            state,
            pool,
            params,
            constants
        );

        if (cache.earlyReturn)
            return (cache.position);

        if (params.amount > 0) {
            cache.position.liquidity -= uint128(params.amount);
        }
        
        // clear position values if empty
        if (cache.position.liquidity == 0) {
            cache.position.epochLast = 0;
            cache.position.claimPriceLast = 0;
        }    
        return cache.position;
    }

    function _convert(
        uint128 liquidity,
        uint128 percent
    ) internal pure returns (
        uint128
    ) {
        // convert percentage to liquidity amount
        if (percent > 1e38) require (false, 'InvalidBurnPercentage()');
        if (liquidity == 0 && percent > 0) require (false, 'NotEnoughPositionLiquidity()');
        return uint128(uint256(liquidity) * uint256(percent) / 1e38);
    }

    function _deltas(
        mapping(address => mapping(int24 => mapping(int24 => ILimitPoolStructs.Position)))
            storage positions,
        mapping(int24 => ILimitPoolStructs.Tick) storage ticks,
        ILimitPoolStructs.TickMap storage tickMap,
        ILimitPoolStructs.GlobalState memory state,
        ILimitPoolStructs.PoolState memory pool,
        ILimitPoolStructs.UpdateParams memory params,
        ILimitPoolStructs.Immutables memory constants
    ) internal view returns (
        ILimitPoolStructs.UpdateParams memory,
        ILimitPoolStructs.UpdateCache memory,
        ILimitPoolStructs.GlobalState memory
    ) {
        ILimitPoolStructs.UpdateCache memory cache = ILimitPoolStructs.UpdateCache({
            position: positions[params.owner][params.lower][params.upper],
            pool: pool,
            priceLower: ConstantProduct.getPriceAtTick(params.lower, constants),
            priceClaim: ConstantProduct.getPriceAtTick(params.claim, constants),
            priceUpper: ConstantProduct.getPriceAtTick(params.upper, constants),
            claimTick: ticks[params.claim],
            earlyReturn: false,
            removeLower: false,
            removeUpper: false
        });

        params.amount = _convert(cache.position.liquidity, params.amount);

        // check claim is valid
        (params, cache) = Claims.validate(
            positions,
            ticks,
            tickMap,
            cache.pool,
            params,
            cache,
            constants
        );
        if (cache.earlyReturn) {
            return (params, cache, state);
        }
        // calculate position deltas
        cache = Claims.getDeltas(cache, params, constants);

        return (params, cache, state);
    }
}