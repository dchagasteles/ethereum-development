// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface IRewardToken is IERC20 {
    function mint(address _to, uint256 _amount) external;

    function setMinterRole(address _addr, bool _status) external;
}
