// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {MevShareBidContract} from "suave/standard_peekers/bids.sol";

contract DeployContracts is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();
        MevShareBidContract bidContract = new MevShareBidContract();
        console2.log("bid contract deployed", address(bidContract));
    }
}
