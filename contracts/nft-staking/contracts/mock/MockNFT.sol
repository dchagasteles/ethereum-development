//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

////////////////////////////////////////////////////////////////////////////////////////////
/// @title MockNFT
/// @author @cruzfernan
/// @notice mock NFT mint contract for testing
////////////////////////////////////////////////////////////////////////////////////////////
contract MockNFT is ERC721, Ownable {
    constructor() ERC721('Mint NFT', 'MN') {}

    function mint(address _account, uint256 _tokenId) public onlyOwner {
        _mint(_account, _tokenId);
    }
}
