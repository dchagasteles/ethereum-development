//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import './interfaces/IPriceOracle.sol';
import './interfaces/IRewardToken.sol';

////////////////////////////////////////////////////////////////////////////////////////////
/// @title NFTStaking
/// @author @cruzfernan
/// @notice NFT staking contract
////////////////////////////////////////////////////////////////////////////////////////////

contract NFTStaking is ERC721Holder {
    /// @notice NFT to being staked
    IERC721 public nftItem;

    /// @notice rERC20 reward token
    IRewardToken public rewardToken;

    /// @notice praice oracle that provies NFT price
    IPriceOracle public priceOracle;

    /// @notice constants to calcualte reward
    uint256 constant DENO = 100;
    uint256 constant ONE_MONTH = 86400 * 7 * 4; // 86400 for one day, 4 weeks for one month

    /// @notice staker information
    struct Staker {
        uint256 timestamp;
        uint256 originalPrice;
        address user;
    }

    ///@dev token Id => staker
    mapping(uint256 => Staker) public stakes;

    /// @dev emited when user stakes NFT
    event Stake(address indexed owner, uint256 id, uint256 time);

    /// @dev emitted when user unstakes NFT
    event UnStake(address indexed owner, uint256 id, uint256 time, uint256 rewardTokens);

    /// @dev emitted when liquidation can happen after unstake
    event CanLiquidated(
        address indexed owner,
        uint256 id,
        uint256 time,
        uint256 originalPrice,
        uint256 newPrice
    );

    constructor(
        address _nftItem,
        address _token,
        address _priceOracle
    ) {
        rewardToken = IRewardToken(_token);
        nftItem = IERC721(_nftItem);
        priceOracle = IPriceOracle(_priceOracle);
    }

    /// @notice It will calculate the rate of the token reward
    /// @dev It will block.timestamp to track the time.
    /// @return the reward rate %
    function calculateRate(uint256 _time) private view returns (uint8) {
        if (block.timestamp - _time < ONE_MONTH) {
            return 0;
        } else if (block.timestamp - _time < ONE_MONTH * 6) {
            return 5;
        } else if (block.timestamp - _time < 12 * ONE_MONTH) {
            return 10;
        } else {
            return 15;
        }
    }

    /// @notice It will give user to stake the NFT.
    /// @dev It will confirm the you have enough NFT to stake.
    /// @param _tokenId token Id of NFT
    function stakeNFT(uint256 _tokenId) public {
        require(nftItem.ownerOf(_tokenId) == msg.sender, 'NOT_OWNER_OF_NFT');

        uint256 nftPrice = priceOracle.getPriceOfNFT(nftItem);
        require(nftPrice > 0, 'ORACLE_NOT_SET');

        stakes[_tokenId] = Staker(block.timestamp, nftPrice, msg.sender);
        nftItem.safeTransferFrom(msg.sender, address(this), _tokenId, '0x00');

        emit Stake(msg.sender, _tokenId, block.timestamp);
    }

    /// @notice provide the calimable reward for NFT staker
    /// @param _staker staker information
    /// @return rewards amount
    function getClaimable(Staker memory _staker) public view returns (uint256) {
        uint256 time = block.timestamp - _staker.timestamp;
        return
            ((priceOracle.getPriceOfNFT(nftItem) * calculateRate(_staker.timestamp) * time) /
                ONE_MONTH) *
            12 *
            DENO;
    }

    /// @notice It will unstake the NFT and distribute the token reward.
    /// @dev It will calculate the reward with calculateRate() and distribute token using IERC20.
    ///      Reward amount = Reward Rate * TimeDiff / RewardInterval
    /// @param _tokenId token Id of NFT
    function unStakeNFT(uint256 _tokenId) public {
        Staker memory staker = stakes[_tokenId];
        require(staker.user == msg.sender, 'NOT_STAKER');

        nftItem.safeTransferFrom(address(this), msg.sender, _tokenId, '0x00');

        uint256 reward = getClaimable(staker);

        if (reward > 0) {
            rewardToken.mint(msg.sender, reward);
        }

        emit UnStake(msg.sender, _tokenId, block.timestamp, reward);

        uint256 latestPrice = priceOracle.getPriceOfNFT(nftItem);
        if (latestPrice < staker.originalPrice / 2) {
            emit CanLiquidated(
                msg.sender,
                _tokenId,
                block.timestamp,
                staker.originalPrice,
                latestPrice
            );
        }
    }
}
