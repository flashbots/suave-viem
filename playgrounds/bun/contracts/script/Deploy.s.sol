// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {BundleBidContract} from "suave/standard_peekers/bids.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();
        BundleBidContract bids = new BundleBidContract();
        console2.log("bid contract deployed", address(bids));
    }
}
