// SPDX-License-Identifier: MIT

pragma solidity ^0.8.35;

import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract Staking is Ownable {

    // State variables
    address public stakingToken;
    uint256 public stakingPeriod;
    uint256 public fixedStakingAmount;
    mapping(address => uint256) public userBalances;
    mapping(address => uint256) public userStakingTimestamps;
    uint256 public rewardPerPeriod;

    event SetStakingPeriod(uint256 newStakingPeriod_);
    event DepositTokens(address  userAddress, uint256 depositAmount_);
    event WithdrawTokens(address userAddress, uint256 withdrawAmount_);
    event etherSent(uint256 amount_);

    constructor(address stakingToken_,uint256 stakingPeriod_, uint256 fixedStakingAmount_,uint256 rewardPerPeriod_, address owner_) Ownable(owner_) {
        // Set the staking token contract address
        stakingToken = stakingToken_;
        // Set the staking period
        stakingPeriod = stakingPeriod_;
        // Set the fixed staking amount
        fixedStakingAmount = fixedStakingAmount_;
        // Set the reward per period
        rewardPerPeriod = rewardPerPeriod_;
    }

    // function 
    // external 

    // Deposit function for users to stake their tokens
    function depositTokens(uint256 tokenAmountToDeposit_) external {

        require(tokenAmountToDeposit_ == fixedStakingAmount, "Incorrect amount");
        require(userBalances[msg.sender] == 0, "User already deposited");

        userBalances[msg.sender] += tokenAmountToDeposit_;
        userStakingTimestamps[msg.sender] = block.timestamp;

        bool success = IERC20(stakingToken).transferFrom(msg.sender, address(this), tokenAmountToDeposit_);
        require(success, "Token transfer failed");
        emit DepositTokens(msg.sender, tokenAmountToDeposit_);

      }

    // Withdraw function for users to unstake their tokens after the staking period has ended
    function withdrawTokens() external {

        uint256 userBalance_ = userBalances[msg.sender];

        userBalances[msg.sender] -= 0; // Reset the user's balance to zero

        bool success = IERC20(stakingToken).transfer(msg.sender, userBalance_);
        require(success, "Token transfer failed");
        emit WithdrawTokens(msg.sender, userBalance_);

    }
    
    // Clean Reward function for users to claim their rewards after the staking period has ended
    function claimReward() external {
        // Check Balance 
        require (userBalances[msg.sender] == fixedStakingAmount, "No staking");

        // Calculate reward based on staked amount and staking period
        uint256 eclapsedTime = block.timestamp - userStakingTimestamps[msg.sender];
        require(eclapsedTime >= stakingPeriod, "Staking period not yet completed");

        // Update user's balance to reflect claimed rewards
        userStakingTimestamps[msg.sender] = block.timestamp; // Reset the staking timestamp for the user

        // Transfer rewards to the user
        (bool success, ) = msg.sender.call{value: rewardPerPeriod}("");
        require(success, "Reward transfer failed");
    }

   receive() external payable onlyOwner {
        // Accept incoming Ether transfers
        emit etherSent(msg.value);
    }
    // internal 

    //onlyOwner
    function setStakingPeriod(uint256 newStakingPeriod_) external onlyOwner {
        // Update the staking period 
        stakingPeriod = newStakingPeriod_;  

        emit SetStakingPeriod(newStakingPeriod_);   

    }

    
}

