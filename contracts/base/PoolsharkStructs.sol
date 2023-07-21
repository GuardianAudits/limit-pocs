// SPDX-License-Identifier: GPLv3
pragma solidity 0.8.13;

interface PoolsharkStructs {
    struct SwapParams {
        address to;
        uint160 priceLimit;
        uint128  amount;
        bool exactIn;
        bool zeroForOne;
        bytes callbackData;
    }
}