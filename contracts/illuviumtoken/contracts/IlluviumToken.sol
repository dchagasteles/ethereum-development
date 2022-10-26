//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import './token/EIP712.sol';
import './token/ERC20.sol';

////////////////////////////////////////////////////////////////////////////////////////////
///
/// @title IlluviumToken
/// @author @conlot-crypto
/// @notice
///
////////////////////////////////////////////////////////////////////////////////////////////
contract IlluviumToken is ERC20, EIP712 {
    /// @dev version
    string public constant version = '1';

    /// @notice max supply of tokens
    uint256 public constant MAX_SPLLY = 1e25;

    /// @dev registered backup address for user
    mapping(address => address) public backupAddress;

    /// @dev nonce being used for generat signaturs
    mapping(address => uint256) public userTransferAllowanceNonce;

    /// @dev backup transfer message digest
    bytes32 internal constant _BACKUP_TRANSFER_SIGNATURE_TYPE_HASH =
        keccak256('BackupTransfer(bytes32 warning,address from,uint amount,uint256 nonce)');

    /// @dev event being triggered when backup transfer happens
    event TransferredToBackup(address _from, address _to, uint256 _amount, uint256 _blockNumber);

    /// @dev setup a IlluviumToken
    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint8 _decimal
    ) {
        initializeERC20(_tokenName, _tokenSymbol, _decimal);
        initializeEIP712(_tokenName, '1');

        _mint(msg.sender, MAX_SPLLY);
    }

    /// @dev setup backup address
    /// @param _backup address where tokens will be transfered when backup happens
    function registerBackupAddress(address _backup) external {
        require(balanceOf(msg.sender) > 0, 'Not token holder');
        require(_backup != address(0), 'Invalid backup address');

        backupAddress[msg.sender] = _backup;
    }

    /// @dev transfer tokens to backup with signed message
    function transferTokensToBackupWithSignedMessage(
        address _from,
        uint256 _amount,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(_from != msg.sender, 'Not delegator');
        require(backupAddress[_from] != address(0), 'Backup address is not registered');
        require(balanceOf(_from) >= _amount, "Exceeds holder's balance");

        bytes32 digest = keccak256(
            abi.encodePacked(
                '\x19\x01',
                _domainSeparatorV4(),
                keccak256(
                    abi.encode(
                        _BACKUP_TRANSFER_SIGNATURE_TYPE_HASH,
                        keccak256('You are transfering tokens to backup'),
                        _from,
                        _amount,
                        userTransferAllowanceNonce[_from]++
                    )
                )
            )
        );

        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress == _from, 'INVALID_SIGNATURE');

        _transferToBackup(_from, backupAddress[_from], _amount);
    }

    /// @dev internal function that does real token transfer to backup
    function _transferToBackup(
        address _from,
        address _to,
        uint256 _amount
    ) internal {
        _transfer(_from, _to, _amount);

        emit TransferredToBackup(_from, _to, _amount, block.number);
    }

    /// @dev token holders transfer tokens to backup without signed message
    function transferToBackup(uint256 _amount) external {
        require(balanceOf(msg.sender) >= _amount, 'Exceeds user balance');
        require(backupAddress[msg.sender] != address(0), 'Backup address is not registered');

        _transferToBackup(msg.sender, backupAddress[msg.sender], _amount);
    }
}
