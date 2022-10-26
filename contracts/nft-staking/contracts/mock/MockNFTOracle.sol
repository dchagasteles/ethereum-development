// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '../interfaces/INFTOracle.sol';

////////////////////////////////////////////////////////////////////////////////////////////
/// @title MockNFTOracle
/// @author @cruzfernan
/// @notice Mock Oracle for NFT price
////////////////////////////////////////////////////////////////////////////////////////////

contract MockNFTOracle is INFTOracle, Ownable {
    IERC721 public nftItem;
    uint256 private price;

    constructor(IERC721 _nftItem) {
        nftItem = _nftItem;
        price = 1e18;
    }

    function setPrice(uint256 _newPrice) external onlyOwner {
        price = _newPrice;
    }

    function latestAnswer() external view override returns (uint256) {
        return price;
    }
}
