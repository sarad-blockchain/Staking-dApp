// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.35;

import {Test} from "forge-std/Test.sol";
import {StakingToken} from "../src/Stakingtoken.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract StakingTokenTest is Test {

    StakingToken stakingToken;
    string  name_ = "Staking Token";
    string  symbol_ = "STK";
    address randomUser = vm.addr(1);
    function setUp() public {
        stakingToken = new StakingToken(name_, symbol_);
    }

    function testStakingTokenMintCorrectly() public {
        vm.startPrank(randomUser);
        uint256 amount_ = 1 ether; // 1*10^18
        // token balance previous 
        uint256 balanceBefore = IERC20(address(stakingToken)).balanceOf(randomUser); // UserA = 50 tokens
        stakingToken.mint(amount_);

        //token balance after minting 
        uint256 balanceAfter = IERC20(address(stakingToken)).balanceOf(randomUser); // UserA = 51 tokens

        assert (balanceAfter - balanceBefore == amount_); // 51 - 50 = 1 token
        vm.stopPrank();
    }
  
}
