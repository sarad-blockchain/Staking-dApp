// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.35;

import {Script, console} from "forge-std/Script.sol";
import {Staking} from "../src/Stakingdapp.sol";
import {StakingToken} from "../src/Stakingtoken.sol";

contract StakingdappScript is Script {

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Parametros del contrato — ajustalos a tu gusto
        uint256 stakingPeriod     = 1 hours;        // 3600 segundos
        uint256 fixedStakingAmount = 100 * 1e18;    // 100 tokens (18 decimales)
        uint256 rewardPerPeriod   = 0.001 ether;    // 0.001 ETH por periodo

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy del token ERC-20
        StakingToken token = new StakingToken("StakingToken", "STK");
        console.log("StakingToken deployed at:", address(token));

        // 2. Deploy del contrato de staking
        Staking staking = new Staking(
            address(token),
            stakingPeriod,
            fixedStakingAmount,
            rewardPerPeriod,
            deployer   // owner = tu wallet
        );
        console.log("Staking deployed at:", address(staking));

        // 3. Fondear el contrato con ETH para las recompensas (0.05 ETH)
        (bool ok,) = address(staking).call{value: 0.05 ether}("");
        require(ok, "Funding failed");
        console.log("Staking funded with 0.05 ETH");

        vm.stopBroadcast();

        console.log("\n=== COPIA ESTAS DIRECCIONES AL FRONTEND ===");
        console.log("STAKING_ADDRESS =", address(staking));
        console.log("TOKEN_ADDRESS   =", address(token));
    }
}
