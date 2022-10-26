// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '../interfaces/IPriceOracle.sol';
import '../interfaces/INFTOracle.sol';

////////////////////////////////////////////////////////////////////////////////////////////
/// @title PriceOracle
/// @author @cruzfernan
/// @notice aggregator of NFT oracles
////////////////////////////////////////////////////////////////////////////////////////////

contract PriceOracle is Ownable, IPriceOracle {
    /// @notice token to the oracle address
    mapping(IERC721 => INFTOracle) public assetToOracle;

    /// @notice adds oracle for an asset e.g. ETH
    /// @param _assets the oracle for the asset
    /// @param _oracles the oracle address
    function setOracleForAsset(IERC721[] calldata _assets, INFTOracle[] calldata _oracles)
        external
        onlyOwner
    {
        require(_assets.length == _oracles.length, 'INV_LENGTH');

        for (uint256 i = 0; i < _assets.length; i++) {
            require(address(_oracles[i]) != address(0), 'INV_ORACLE');
            assetToOracle[_assets[i]] = _oracles[i];
        }
    }

    /// @notice remove oracle
    function removeOracleForAsset(IERC721 _asset) external onlyOwner {
        assetToOracle[_asset] = INFTOracle(address(0));
    }

    /// @notice returns price of token in USD in 1e8 decimals
    /// @param _token token to fetch price
    function getPriceOfNFT(IERC721 _token) public view override returns (uint256 price) {
        INFTOracle oracle = assetToOracle[_token];

        if (address(oracle) != address(0)) {
            price = assetToOracle[_token].latestAnswer();
        }

        require(price > 0, 'NO_PRICE');
    }
}
