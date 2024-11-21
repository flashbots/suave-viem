# ![suave-viem](./suave-viem-logo-white.png)

A fork of [viem](https://viem.sh/) for [SUAVE](https://suave-alpha.flashbots.net/).

> :warning: **ALPHA SOFTWARE**: This code relies on the SUAVE protocol, and both are subject to change. Please use it with caution. The [SUAVE spec](https://github.com/flashbots/suave-specs/tree/main) has not yet stabilized, so we are currently refraining from merging this work upstream.

**See the suave examples for usage:**

- [examples/suave](./examples/suave/)
- [examples/suave-web-demo](./examples/suave-web-demo/)

## about suave

SUAVE implements a new transaction type: [Confidential Compute Requests](https://github.com/flashbots/suave-specs/blob/main/specs/rigil/kettle.md#confidentialcomputerequest) (CCRs).

CCRs rely on a custom signature scheme, with the option to use EIP-712 to sign the payload.

[EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) wallets use either `eth_signTypedData_v4` (EIP-712) or `eth_sign` (generally regarded as unsafe) to sign confidential requests. We recommend always using EIP-712, which is the default. This default can be overridden by setting `isEIP712` in the request being signed.
