// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import './interfaces/IRewardToken.sol';

////////////////////////////////////////////////////////////////////////////////////////////
/// @title RewardToken
/// @author @cruzfernan
/// @notice ERC20 token will be used as reward for NFT staker
////////////////////////////////////////////////////////////////////////////////////////////
contract RewardToken is ERC20Burnable, AccessControl, IRewardToken {
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');

    event MinterRoleUpdated(address indexed user, uint256 timestamp, bool status);

    constructor() ERC20('Stake Reward Token', 'RWT') {
        _grantRole(DEFAULT_ADMIN_ROLE, address(msg.sender));
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }

    function setMinterRole(address _addr, bool _status)
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_addr != address(0), 'INV_USER');

        if (_status) {
            _grantRole(MINTER_ROLE, _addr);
        } else {
            _revokeRole(MINTER_ROLE, _addr);
        }

        emit MinterRoleUpdated(_addr, block.timestamp, _status);
    }

    function mint(address _to, uint256 _amount) public override onlyRole(MINTER_ROLE) {
        _mint(_to, _amount);
    }
}
