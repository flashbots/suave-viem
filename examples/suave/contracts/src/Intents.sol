// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "suave/libraries/Suave.sol";
import "suave/standard_peekers/bids.sol";

struct LimitOrder {
    address token_in;
    address token_out;
    uint256 amount_in_max;
    uint256 amount_out_min;
    uint256 expiry_timestamp; // unix seconds
    bytes32 sender_key;
}

contract Intents {
    event Test(
        uint64 num
    );
    event LimitOrderReceived(address token_in, address token_out, uint256 expiry_timestamp);

    fallback() external {
        emit Test(0x9001);
    }

    /// Returns ABI-encoded calldata of `onReceivedIntent(n)`.
    function encodeOnReceivedIntent(LimitOrder memory order) private pure returns (bytes memory) {
        return bytes.concat(
            this.onReceivedIntent.selector,
            abi.encode(order.token_in, order.token_out, order.expiry_timestamp)
        );
    }

    /// Triggered by `sendIntent` upon successful resolution.
    function onReceivedIntent(address token_in, address token_out, uint256 expiry_timestamp) public {
        emit LimitOrderReceived(token_in, token_out, expiry_timestamp);
    }

    function sendIntent() public view returns (bytes memory x) {
        // ensure we're computing in the enclave
        require(Suave.isConfidential(), "not confidential");

        // get the confidential inputs and save the intent to confidential storage
        bytes memory confidentialInputs = Suave.confidentialInputs();
        LimitOrder memory order = abi.decode(confidentialInputs, (LimitOrder));
        // TODO: cool precompile stuff
        // ...

        // returns calldata of `onReceivedIntent()`
        x = encodeOnReceivedIntent(order);
    }
}
