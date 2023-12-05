// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "suave/libraries/Suave.sol";
import "suave/standard_peekers/bids.sol";
import "./SuaveWallet.sol";

/// Limit order for a swap. Used as a simple example for intents delivery system.
struct LimitOrder {
    address token_in;
    address token_out;
    uint256 amount_in_max;
    uint256 amount_out_min;
    uint256 expiry_timestamp; // unix seconds
    bytes32 sender_key;
}

/// A reduced version of the original limit order to be shared publicly.
struct LimitOrderPublic {
    address token_in;
    address token_out;
    uint256 amount_in_max;
    uint256 amount_out_min;
    uint256 expiry_timestamp;
}

contract Intents {
    // we probably shouldn't be storing intents in storage
    // TODO: make a stateless design
    mapping(bytes32 => LimitOrderPublic) public intents_pending;

    event Test(uint64 num);
    event LimitOrderReceived(
        address token_in,
        address token_out,
        uint256 expiry_timestamp,
        uint256 random
    );

    fallback() external {
        emit Test(0x9001);
    }

    /// Returns ABI-encoded calldata of `onReceivedIntent(...)`.
    function encodeOnReceivedIntent(
        LimitOrderPublic memory order,
        bytes32 hashkey,
        uint256 random
    ) private pure returns (bytes memory) {
        return
            bytes.concat(
                this.onReceivedIntent.selector,
                abi.encode(order, hashkey, random)
            );
    }

    /// Triggered when an intent is successfully received.
    /// Emits an event on SUAVE chain w/ the tokens traded and the order's expiration timestamp.
    function onReceivedIntent(
        LimitOrderPublic calldata order,
        bytes32 hashkey,
        uint256 random
    ) public {
        // check that this order doesn't already exist; check any value in the struct against 0
        if (intents_pending[hashkey].amount_in_max > 0) {
            revert("intent already exists");
        }
        intents_pending[hashkey] = order;

        /* error:
            can't deploy contract from here, and can't deploy w/ 0x0 tx because
            SuaveWallet constructor requires Suave.isConfidential
        */
        // SuaveWallet wallet = new SuaveWallet(1); // 1: mainnet

        // bytes memory txRequest = "0x"; // TODO: real tx request
        // (bool success, bytes memory data) = wallet.sendTransaction(txRequest);
        // require(success, "failure");

        emit LimitOrderReceived(
            order.token_in,
            order.token_out,
            order.expiry_timestamp,
            random
        );
    }

    /// Broadcast an intent to SUAVE.
    function sendIntent() public view returns (bytes memory suave_call_data) {
        // ensure we're computing in the enclave
        require(Suave.isConfidential(), "not confidential");

        // get the confidential inputs and save the intent to confidential storage
        bytes memory confidential_inputs = Suave.confidentialInputs();
        LimitOrder memory order = abi.decode(confidential_inputs, (LimitOrder));

        // strip private key from public order
        LimitOrderPublic memory public_order = LimitOrderPublic(
            order.token_in,
            order.token_out,
            order.amount_in_max,
            order.amount_out_min,
            order.expiry_timestamp
        );
        bytes memory public_data = abi.encode(public_order);

        uint256 random = Suave.randomUint();

        // returns calldata to trigger `onReceivedIntent()`
        suave_call_data = encodeOnReceivedIntent(
            public_order,
            keccak256(public_data),
            random
        );
    }
}
