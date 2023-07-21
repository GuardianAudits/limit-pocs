// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '../../interfaces/ILimitPoolStructs.sol';
import '../Positions.sol';
import '../utils/Collect.sol';

library BurnCall {
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

    function perform(
        ILimitPoolStructs.BurnParams memory params,
        ILimitPoolStructs.BurnCache memory cache,
        ILimitPoolStructs.TickMap storage tickMap,
        mapping(int24 => ILimitPoolStructs.Tick) storage ticks,
        mapping(address => mapping(int24 => mapping(int24 => ILimitPoolStructs.Position)))
            storage positions
    ) external returns (ILimitPoolStructs.BurnCache memory) {
       if (cache.position.claimPriceLast > 0
            || params.claim != (params.zeroForOne ? params.lower : params.upper)
            || cache.position.epochLast < (params.zeroForOne ? EpochMap.get(params.lower, tickMap, cache.constants)
                                                             : EpochMap.get(params.upper, tickMap, cache.constants)))
        //TODO: claim is still lower but position has been crossed into - DONE
        //TODO: test case for this now
        // or position has been crossed into
        {
            // if position has been crossed into
            (
                cache.state,
                cache.pool,
                params.claim
            ) = Positions.update(
                positions,
                ticks,
                tickMap,
                cache.state,
                cache.pool,
                ILimitPoolStructs.UpdateParams(
                    msg.sender,
                    params.to,
                    params.burnPercent,
                    params.lower,
                    params.upper,
                    params.claim,
                    params.zeroForOne
                ),
                cache.constants
            );
        } else {
            // if position hasn't been crossed into
            (, cache.pool) = Positions.remove(
                positions,
                ticks,
                tickMap,
                cache.pool,
                ILimitPoolStructs.UpdateParams(
                    msg.sender,
                    params.to,
                    params.burnPercent,
                    params.lower,
                    params.upper,
                    params.zeroForOne ? params.lower : params.upper,
                    params.zeroForOne
                ),
                cache.constants
            );
        }
        Collect.burn(
            cache,
            positions,
            params
        );
        return cache;
    }
}
