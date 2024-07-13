// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title EnhancedToken - An ERC20 token with additional features
/// @author Your Name
/// @notice This contract implements an ERC20 token with capped supply, burning, pausing, and blacklisting capabilities
/// @dev Inherits from ERC20Capped, ERC20Burnable, Pausable, and Ownable
contract EnhancedToken is ERC20Capped, ERC20Burnable, Pausable, Ownable {
    /// @notice The cooldown period between transfers for each address
    uint256 public constant TRANSFER_COOLDOWN = 1 minutes;

    /// @notice Mapping to store the last transfer timestamp for each address
    mapping(address => uint256) private _lastTransferTimestamp;
    
    /// @notice Mapping to store blacklist status of addresses
    mapping(address => bool) public blacklist;

    /// @notice Emitted when an address is added to or removed from the blacklist
    /// @param account The address whose blacklist status was updated
    /// @param blacklisted The new blacklist status of the address
    event BlacklistUpdated(address indexed account, bool blacklisted);

    /// @notice Constructs the EnhancedToken contract
    /// @dev Mints the initial supply to the contract deployer
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param cap The maximum cap on the token's total supply
    /// @param initialSupply The initial supply of tokens to mint
    constructor(string memory name, string memory symbol, uint256 cap, uint256 initialSupply) 
        ERC20(name, symbol)
        ERC20Capped(cap)
        Ownable(msg.sender)
    {
        require(initialSupply <= cap, "Initial supply exceeds cap");
        _mint(msg.sender, initialSupply);
    }

    /// @notice Mints new tokens
    /// @dev Only the owner can mint new tokens, and the total supply cannot exceed the cap
    /// @param to The address that will receive the minted tokens
    /// @param amount The amount of tokens to mint
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /// @notice Internal function to mint tokens
    /// @dev Overrides _mint from ERC20 and ERC20Capped to ensure the cap is respected
    /// @param account The address that will receive the minted tokens
    /// @param amount The amount of tokens to mint
    function _mint(address account, uint256 amount) internal override {
        super._mint(account, amount);
    }

    /// @notice Pauses all token transfers
    /// @dev Only the owner can pause the contract
    function pause() public onlyOwner {
        _pause();
    }

    /// @notice Unpauses all token transfers
    /// @dev Only the owner can unpause the contract
    function unpause() public onlyOwner {
        _unpause();
    }

    /// @notice Updates the blacklist status of an address
    /// @dev Only the owner can update the blacklist
    /// @param account The address to update
    /// @param blacklisted The new blacklist status
    function updateBlacklist(address account, bool blacklisted) public onlyOwner {
        blacklist[account] = blacklisted;
        emit BlacklistUpdated(account, blacklisted);
    }

    /// @notice Internal function to update balances and total supply
    /// @dev Overrides _update from ERC20 to add transfer restrictions
    /// @param from The address to transfer from
    /// @param to The address to transfer to
    /// @param amount The amount of tokens to transfer
    function _update(address from, address to, uint256 amount) internal override(ERC20,ERC20Capped){
        require(!blacklist[from] && !blacklist[to], "Transfer rejected: Blacklisted address");
        require(block.timestamp >= _lastTransferTimestamp[from] + TRANSFER_COOLDOWN, "Transfer rejected: Cooldown period");
        _lastTransferTimestamp[from] = block.timestamp;
        super._update(from, to, amount);
    }
}