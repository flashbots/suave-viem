// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "suave/libraries/Suave.sol";

contract ConfidentialWithLogs {
    event SimResultEvent(
        uint64 egp
    );

    event Test(
        uint64 num
    );

    constructor() {
      emit Test(1);
    }

    fallback() external {
        emit Test(2);
    }

    function fetchBidConfidentialBundleData() public returns (bytes memory x) {
        emit Test(101);
        // require(Suave.isConfidential(), "not confidential");

        // bytes memory confidentialInputs = Suave.confidentialInputs();
        // return abi.decode(confidentialInputs, (bytes));
        x = hex"deadbeef";
    }

    // note: this enables the result of the confidential compute request (CCR)
    // to be emitted on chain
    function emitSimResultEvent(uint64 egp) public {
        emit SimResultEvent(egp);
    }

    // note: because of confidential execution,
    // you will not see your input as input to the function
    function helloWorld() external returns (bytes memory) {
        // 0. ensure confidential execution
        // require(Suave.isConfidential(), "not confidential");

        // 1. fetch bundle data
        bytes memory bundleData = this.fetchBidConfidentialBundleData();

        // 2. sim bundle and get effective gas price
        uint64 effectiveGasPrice = Suave.simulateBundle(bundleData);

        // note: this enables the computation result to be emitted on chain
        return bytes.concat(this.emitSimResultEvent.selector, abi.encode(effectiveGasPrice));
    }
}