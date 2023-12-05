// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "suave/libraries/Suave.sol";
import "openzeppelin/access/Ownable.sol";
import "./util/HexEncoder.sol";

import "forge/console2.sol";

contract SuaveWallet is Ownable(msg.sender) {
    // bytes32 private immutable key;
    // uint256 private immutable chain_id;
    // save the hex-string versions instead, since we only use those
    // even better would be to just accept the raw bytes in the precompile lib
    string private s_key;
    string private s_chainId;
    bool private initialized;

    event Noop(bytes data);

    fallback() external payable {
        emit Noop(msg.data);
    }

    constructor(uint256 _chainId) {
        // key = bytes32(Suave.randomUint());
        // chain_id = _chainId;
        // save stringified version of private key
        // TODO: store keys in ConfidentialStore, not in the contract
        initialized = false;
        s_chainId = HexEncoder.bytes32ToHexString(bytes32(_chainId));
    }

    function initialize() public onlyOwner returns (address walletAddress) {
        s_key = HexEncoder.bytes32ToHexString(bytes32(Suave.randomUint()));
        // Suave.s
    }

    function sendTransaction(
        bytes calldata txRequest
    ) public onlyOwner returns (bool success, bytes memory data) {
        require(initialized, "wallet is not initialized");
        bytes memory signedTx = Suave.signEthTransaction(
            txRequest,
            s_chainId,
            s_key
        );

        // TODO: send tx

        return (true, signedTx);
    }
}
