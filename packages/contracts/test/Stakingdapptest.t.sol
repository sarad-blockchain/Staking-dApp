// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.35;

import {Test} from "lib/forge-std/src/Test.sol";
import  "../src/Stakingtoken.sol";
import "../src/Stakingdapp.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract StakingDappTest is Test {

    StakingToken stakingToken;
    Staking staking;

    // Staking token parameters
    string  name_ = "Staking Token";
    string  symbol_ = "STK";

    // Staking dapp parameters
    uint256 stakingPeriod_ = 1 days;
    uint256 fixedStakingAmount_ = 10 ; // 10*10^18
    uint256 rewardPerPeriod_ = 1; // 1*10^18
    address owner_ = vm.addr(1);

    address randomUser = vm.addr(2);

    function setUp() public {
        stakingToken = new StakingToken(name_, symbol_);
        staking = new Staking(address(stakingToken), stakingPeriod_, fixedStakingAmount_, rewardPerPeriod_, owner_);
    }
    function testTokenCorectlyDeployed() external view{
        assert (address(stakingToken) != address(0));
    }

    function testStakingDappCorrectlyDeployed() external view{
        assert (address(staking) != address(0));
    }

    function testRevertIfNoOwner() external {
        uint256 newStakingPeriod_ = 1;
        vm.expectRevert();
        staking.setStakingPeriod(newStakingPeriod_);
    }

     function testShouldChangeStakingPeriod() external {
        vm.startPrank(owner_);
        uint256 newStakingPeriod_ = 1;

        uint256 previousStakingPeriod = staking.stakingPeriod();

        staking.setStakingPeriod(newStakingPeriod_);

        uint256 afterStakingPeriod = staking.stakingPeriod();

        assert (afterStakingPeriod != previousStakingPeriod);
        assert (afterStakingPeriod == newStakingPeriod_);

        vm.stopPrank();
    }

    function testContractReceiveEther() external {
    vm.startPrank(owner_);
    vm.deal(owner_, 1 ether); // Fund the owner with 10 ether for testing
    uint256 amount_ = 1 ether;

    uint256 beforeBalances = address(staking).balance;
    (bool success, ) = address(staking).call{value: amount_}("");
    require(success, "Ether transfer failed");
    uint256 afterBalances = address(staking).balance;

    assert (afterBalances - beforeBalances == amount_);
    vm.stopPrank();
    }

    // Deposit function test
    function testIncorrectAmountShouldRevert() external {
        vm.startPrank(randomUser);
        uint256 incorrectAmount_ = 5; // Incorrect amount, should be 10

        vm.expectRevert("Incorrect amount");
        staking.depositTokens(incorrectAmount_);

        vm.stopPrank();
    }

    function testDepositTokensCorrectly() external {
        vm.startPrank(randomUser);

        uint256 amount_ = staking.fixedStakingAmount(); // Correct amount, should be 10
        stakingToken.mint(amount_); // Mint tokens to the random user

        uint256 userBalanceBefore = staking.userBalances(randomUser); // Get the user's balance before deposit
        uint256 userElapsedPeriodBefore = staking.userStakingTimestamps(randomUser); // Get the user's staking timestamp before deposit

        IERC20(stakingToken).approve(address(staking), amount_); // Approve the staking dapp to spend the user's tokens
        staking.depositTokens(amount_); // Deposit tokens to the staking dapp
        
        uint256 userBalanceAfter = staking.userBalances(randomUser);
        uint256 userElapsedPeriodAfter = staking.userStakingTimestamps(randomUser);

        assert (userBalanceAfter - userBalanceBefore == amount_); // Check if the user's balance in the staking dapp increased by the correct amount
        assert (userElapsedPeriodBefore == 0); // Check if the user's staking timestamp was updated
        assert (userElapsedPeriodAfter == block.timestamp); // Check if the user's staking timestamp was updated to the current block timestamp
        vm.stopPrank();
    }

    function testUsersAlreadyDepositTokensMoreThanOnce() external {
        vm.startPrank(randomUser);

        uint256 amount_ = staking.fixedStakingAmount(); // Correct amount, should be 10
        stakingToken.mint(amount_); // Mint tokens to the random user

        uint256 userBalanceBefore = staking.userBalances(randomUser); // Get the user's balance before deposit
        uint256 userElapsedPeriodBefore = staking.userStakingTimestamps(randomUser); // Get the user's staking timestamp before deposit

        IERC20(stakingToken).approve(address(staking), amount_); // Approve the staking dapp to spend the user's tokens
        staking.depositTokens(amount_); // Deposit tokens to the staking dapp
        
        uint256 userBalanceAfter = staking.userBalances(randomUser);
        uint256 userElapsedPeriodAfter = staking.userStakingTimestamps(randomUser);

        assert (userBalanceAfter - userBalanceBefore == amount_); // Check if the user's balance in the staking dapp increased by the correct amount
        assert (userElapsedPeriodBefore == 0); // Check if the user's staking timestamp was updated
        assert (userElapsedPeriodAfter == block.timestamp); // Check if the user's staking timestamp was updated to the current block timestamp
       
       
        stakingToken.mint(amount_);
        IERC20(stakingToken).approve(address(staking), amount_); // Approve the staking dapp to spend the user's tokens

        vm.expectRevert("User already deposited");
        staking.depositTokens(amount_); // Deposit tokens to the staking dapp

        vm.stopPrank();
    }

    // Withdraw function test
    function testCanOnlyWithdrawDepositedTokens() external {
        vm.startPrank(randomUser);

        uint256 userBalancesBefore = staking.userBalances(randomUser); // Get the user's balance before deposit
        staking.withdrawTokens();
        uint256 userBalancesAfter = staking.userBalances(randomUser); // Get the user's balance after withdrawal

        assert (userBalancesAfter == userBalancesBefore); // Check if the user's balance in the staking dapp is unchanged

        vm.stopPrank();
    }

     function testWithdrawTokensCorrectly() external {
        vm.startPrank(randomUser);

        // First, the user needs to deposit tokens before they can withdraw
        uint256 amount_ = staking.fixedStakingAmount(); // Correct amount, should be 10
        stakingToken.mint(amount_); // Mint tokens to the random user

        uint256 userBalanceBefore = staking.userBalances(randomUser); // Get the user's balance before deposit
        uint256 userElapsedPeriodBefore = staking.userStakingTimestamps(randomUser); // Get the user's staking timestamp before deposit

        IERC20(stakingToken).approve(address(staking), amount_); // Approve the staking dapp to spend the user's tokens
        staking.depositTokens(amount_); // Deposit tokens to the staking dapp
        
        uint256 userBalanceAfter = staking.userBalances(randomUser);
        uint256 userElapsedPeriodAfter = staking.userStakingTimestamps(randomUser);

        assert (userBalanceAfter - userBalanceBefore == amount_); // Check if the user's balance in the staking dapp increased by the correct amount
        assert (userElapsedPeriodBefore == 0); // Check if the user's staking timestamp was updated
        assert (userElapsedPeriodAfter == block.timestamp); 

        // Now the user can withdraw their tokens
        uint256 userBalancesBefore2 = IERC20(stakingToken).balanceOf(randomUser); // Get the user's balance before deposit
        uint256 userBalancesInMapping = staking.userBalances(randomUser);
        staking.withdrawTokens();
        uint256 userBalancesAfter2 = staking.userBalances(randomUser); // Get the user's balance after withdrawal
        
        assert (userBalancesAfter2 == userBalancesBefore2 + userBalancesInMapping); // Check if the user's balance in the staking dapp is unchanged

        vm.stopPrank();
    }

    // Claim reward function test
    function testCanNotClaimIfNotStaking() external {
        vm.startPrank(randomUser);

        vm.expectRevert("No staking");
        staking.claimReward();

        vm.stopPrank();
    }

    function testCanNotClaimIfStakingPeriodNotEnded() external {
        vm.startPrank(randomUser);

        // First, the user needs to deposit tokens before they can claim rewards
         uint256 amount_ = staking.fixedStakingAmount(); // Correct amount, should be 10
        stakingToken.mint(amount_); // Mint tokens to the random user

        uint256 userBalanceBefore = staking.userBalances(randomUser); // Get the user's balance before deposit
        uint256 userElapsedPeriodBefore = staking.userStakingTimestamps(randomUser); // Get the user's staking timestamp before deposit

        IERC20(stakingToken).approve(address(staking), amount_); // Approve the staking dapp to spend the user's tokens
        staking.depositTokens(amount_); // Deposit tokens to the staking dapp
        
        uint256 userBalanceAfter = staking.userBalances(randomUser);
        uint256 userElapsedPeriodAfter = staking.userStakingTimestamps(randomUser);

        assert (userBalanceAfter - userBalanceBefore == amount_); // Check if the user's balance in the staking dapp increased by the correct amount
        assert (userElapsedPeriodBefore == 0); // Check if the user's staking timestamp was updated
        assert (userElapsedPeriodAfter == block.timestamp); 

        // Now the user can claim their rewards
        vm.expectRevert("Staking period not yet completed");
        staking.claimReward();

        vm.stopPrank();
    }

    
    function testShouldRevertIfNotEther() external {
        vm.startPrank(randomUser);

        // First, the user needs to deposit tokens before they can claim rewards
         uint256 amount_ = staking.fixedStakingAmount(); // Correct amount, should be 10
        stakingToken.mint(amount_); // Mint tokens to the random user

        uint256 userBalanceBefore = staking.userBalances(randomUser); // Get the user's balance before deposit
        uint256 userElapsedPeriodBefore = staking.userStakingTimestamps(randomUser); // Get the user's staking timestamp before deposit

        IERC20(stakingToken).approve(address(staking), amount_); // Approve the staking dapp to spend the user's tokens
        staking.depositTokens(amount_); // Deposit tokens to the staking dapp
        
        uint256 userBalanceAfter = staking.userBalances(randomUser);
        uint256 userElapsedPeriodAfter = staking.userStakingTimestamps(randomUser);

        assert (userBalanceAfter - userBalanceBefore == amount_); // Check if the user's balance in the staking dapp increased by the correct amount
        assert (userElapsedPeriodBefore == 0); // Check if the user's staking timestamp was updated
        assert (userElapsedPeriodAfter == block.timestamp); 

        // Now the user can claim their rewards
        vm.warp(block.timestamp + stakingPeriod_);
        vm.expectRevert("Reward transfer failed");
        staking.claimReward();

        vm.stopPrank();
    }

    
    function testCanClaimReward() external {
        vm.startPrank(randomUser);

        // First, the user needs to deposit tokens before they can claim rewards
         uint256 amount_ = staking.fixedStakingAmount(); // Correct amount, should be 10
        stakingToken.mint(amount_); // Mint tokens to the random user

        uint256 userBalanceBefore = staking.userBalances(randomUser); // Get the user's balance before deposit
        uint256 userElapsedPeriodBefore = staking.userStakingTimestamps(randomUser); // Get the user's staking timestamp before deposit

        IERC20(stakingToken).approve(address(staking), amount_); // Approve the staking dapp to spend the user's tokens
        staking.depositTokens(amount_); // Deposit tokens to the staking dapp
        
        uint256 userBalanceAfter = staking.userBalances(randomUser);
        uint256 userElapsedPeriodAfter = staking.userStakingTimestamps(randomUser);

        assert (userBalanceAfter - userBalanceBefore == amount_); // Check if the user's balance in the staking dapp increased by the correct amount
        assert (userElapsedPeriodBefore == 0); // Check if the user's staking timestamp was updated
        assert (userElapsedPeriodAfter == block.timestamp); 
        
        vm.stopPrank();

        // Send ether to the staking dapp to fund it for testing reward claims
        vm.startPrank(owner_);
        uint256 etherAmount_ = 100000 ether;
        vm.deal(owner_, etherAmount_); // Fund the owner with ether for testing
        (bool success, ) = address(staking).call{value: etherAmount_}(""); // Fund the staking dapp with ether for testing
        require(success, "Ether transfer failed");
        vm.stopPrank();

        // Now the user can claim their rewards
        vm.startPrank(randomUser);
        vm.warp(block.timestamp + stakingPeriod_);
        uint256 userEtherBalanceBefore = address(randomUser).balance; // Get the user's ether balance before claiming rewards
        staking.claimReward();
        uint256 userEtherBalanceAfter = address(randomUser).balance; // Get the user's ether balance after claiming rewards
        uint256 userElapsedTime = staking.userStakingTimestamps(randomUser); // Get the user's staking timestamp after claiming rewards
       
        assert (userEtherBalanceAfter - userEtherBalanceBefore == rewardPerPeriod_); // Check if the user's ether balance increased by the correct reward amount
        assert (userElapsedTime == block.timestamp); // Check if the user's staking timestamp was reset to the current block timestamp after claiming rewards
        vm.stopPrank();

    }

}