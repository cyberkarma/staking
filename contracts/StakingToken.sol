// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './Token.sol';

contract StakingToken is ERC20 {
    constructor() ERC20("Staking", "ST", 10000, 0) {}

}