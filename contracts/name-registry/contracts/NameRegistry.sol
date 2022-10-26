pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

contract NameRegistry is Ownable {
    /* ============ Structs ============ */

    struct Name {
        address owner;
        uint256 lockedBalance;
        uint256 reserveExpire;
        uint256 registerExpire;
    }

    /* ============ State Variables ============ */

    uint256 private constant FACTOR = 1e18;

    uint256 public lengthFactor;
    uint256 public durationFactor;
    uint256 public reserveExpireDuration;
    uint256 public totalFees;

    mapping(bytes32 => Name) public names;

    /* ============ Functions ============ */

    constructor(
        uint256 _lengthFactor,
        uint256 _durationFactor,
        uint256 _reserveExpireDuration
    ) {
        lengthFactor = _lengthFactor;
        durationFactor = _durationFactor;
        reserveExpireDuration = _reserveExpireDuration;
    }

    /* ============ Externals ============ */

    function reserve(bytes32 _hash) external {
        Name memory name = names[_hash];
        require(name.registerExpire < block.timestamp, "Already registered");
        require(name.reserveExpire < block.timestamp, "Already reserved");

        if (name.lockedBalance > 0) {
            _releaseLockedBalance(_hash);
        }

        names[_hash].owner = msg.sender;
        names[_hash].reserveExpire = block.timestamp + reserveExpireDuration;
    }

    function register(string calldata strName) external payable {
        bytes32 hash = keccak256(abi.encodePacked(strName));
        Name memory name = names[hash];
        require(name.owner == msg.sender, "Not reserve owner");
        require(block.timestamp <= name.reserveExpire, "Reservation expired");
        require(block.timestamp > name.registerExpire, "Already registered");

        _collectFeeAndRegister(hash, bytes(strName).length);
    }

    function renew(string calldata strName) external payable {
        bytes32 hash = keccak256(abi.encodePacked(strName));
        Name memory name = names[hash];

        require(name.owner == msg.sender, "Not owner");
        require(block.timestamp <= name.registerExpire, "Registration expired");

        _releaseLockedBalance(hash);

        _collectFeeAndRegister(hash, bytes(strName).length);
    }

    function claimUnLockedBalance(bytes32 hash) external {
        require(names[hash].owner == msg.sender, "Not owner");
        require(block.timestamp > names[hash].registerExpire, "Locked yet");
        require(names[hash].lockedBalance > 0, "Already claimed");

        _releaseLockedBalance(hash);
    }

    /* ============ Admin ============ */

    function setLengthFactor(uint256 _lengthFactor) external onlyOwner {
        lengthFactor = _lengthFactor;
    }

    function setDurationFactor(uint256 _durationFactor) external onlyOwner {
        durationFactor = _durationFactor;
    }

    function setReserveExpireDuration(uint256 _reserveExpireDuration)
        external
        onlyOwner
    {
        reserveExpireDuration = _reserveExpireDuration;
    }

    function withdrawFee(address _to) external onlyOwner {
        uint256 fee = totalFees;
        totalFees = 0;
        (bool success, ) = _to.call{value: fee}("");
        require(success, "");
    }

    /* ============ Views ============ */

    function getOwner(string calldata strName) public view returns (address) {
        bytes32 hash = keccak256(abi.encodePacked(strName));

        if (names[hash].registerExpire < block.timestamp) return address(0);

        return names[hash].owner;
    }

    /* ============ Internals ============ */

    function _collectFeeAndRegister(bytes32 _hash, uint256 length) private {
        uint256 fee = (msg.value * lengthFactor * length) / FACTOR;
        uint256 lockedBalance = msg.value - fee;
        uint256 duration = lockedBalance / durationFactor;
        require(duration > 0, "Not enough balace");

        names[_hash].registerExpire = block.timestamp + duration;
        names[_hash].lockedBalance = lockedBalance;

        totalFees = totalFees + fee;
    }

    function _releaseLockedBalance(bytes32 _hash) private {
        uint256 locked = names[_hash].lockedBalance;
        if (locked > 0) {
            names[_hash].lockedBalance = 0;
            (bool success, ) = names[_hash].owner.call{value: locked}("");
            require(success, "");
        }
    }
}
