// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge/StdAssertions.sol";
import "forge/Test.sol";
import "forge/console2.sol";

import "./HexEncoder.sol";

contract HexEncoderTest is Test {
    function testEncodeUint() public {
        uint256 x = 0x12345678;
        string memory s = HexEncoder.bytes32ToHexString(bytes32(x));
        assertEq(
            s,
            "0000000000000000000000000000000000000000000000000000000012345678"
        );
    }

    function testEncodeBytes32() public {
        bytes32 x = bytes32(
            0x1020304050607080901011012013014015016017018019020210220230240256
        );
        string memory s = HexEncoder.bytes32ToHexString(bytes32(x));
        assertEq(
            s,
            "1020304050607080901011012013014015016017018019020210220230240256"
        );
    }
}
