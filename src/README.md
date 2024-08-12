> :warning: **ALPHA SOFTWARE**: This code relies on the SUAVE protocol, and both are subject to change. Please use it with caution. The [SUAVE spec](https://github.com/flashbots/suave-specs/tree/main) has not yet stabilized, so we are currently refraining from merging this work upstream. [Confidential Compute Requests](https://github.com/flashbots/suave-specs/blob/main/specs/rigil/kettle.md#confidentialcomputerequest) rely on a custom signature scheme, with the option to use EIP-712 to sign the payload. [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) wallets use either `eth_signTypedData_v4` (EIP-712) or `eth_sign` (generally regarded as unsafe) to sign confidential requests. We recommend always using EIP-712, which is the default. This default can be overridden by setting `isEIP712` in the request being signed.

<br/>

<p align="center">
  <a href="https://viem.sh">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/wagmi-dev/viem/blob/main/.github/gh-logo-dark.svg">
        <img alt="viem logo" src="https://github.com/wagmi-dev/viem/blob/main/.github/gh-logo-light.svg" width="auto" height="60">
      </picture>
</a>
</p>

<p align="center">
  TypeScript Interface for Ethereum
<p>

<p align="center">
  <a href="https://www.npmjs.com/package/viem">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/npm/v/viem?colorA=21262d&colorB=21262d&style=flat">
      <img src="https://img.shields.io/npm/v/viem?colorA=f6f8fa&colorB=f6f8fa&style=flat" alt="Version">
    </picture>
  </a>
  <a href="https://app.codecov.io/gh/wagmi-dev/viem">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/codecov/c/github/wagmi-dev/viem?colorA=21262d&colorB=21262d&style=flat">
      <img src="https://img.shields.io/codecov/c/github/wagmi-dev/viem?colorA=f6f8fa&colorB=f6f8fa&style=flat" alt="Code coverage">
    </picture>
  </a>
  <a href="https://github.com/wagmi-dev/viem/blob/main/LICENSE">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/npm/l/viem?colorA=21262d&colorB=21262d&style=flat">
      <img src="https://img.shields.io/npm/l/viem?colorA=f6f8fa&colorB=f6f8fa&style=flat" alt="MIT License">
    </picture>
  </a>
  <a href="https://www.npmjs.com/package/viem">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/npm/dm/viem?colorA=21262d&colorB=21262d&style=flat">
      <img src="https://img.shields.io/npm/dm/viem?colorA=f6f8fa&colorB=f6f8fa&style=flat" alt="Downloads per month">
    </picture>
  </a>
  <a href="https://bestofjs.org/projects/viem">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/endpoint?colorA=21262d&colorB=21262d&style=flat&url=https://bestofjs-serverless.now.sh/api/project-badge?fullName=wagmi-dev%2Fviem%26since=daily">
      <img src="https://img.shields.io/endpoint?colorA=f6f8fa&colorB=f6f8fa&style=flat&url=https://bestofjs-serverless.now.sh/api/project-badge?fullName=wagmi-dev%2Fviem%26since=daily" alt="Best of JS">
    </picture>
  </a>
</p>

<br>

## Features

- Abstractions over the [JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/) to make your life easier
- First-class APIs for interacting with [Smart Contracts](https://ethereum.org/en/glossary/#smart-contract)
- Language closely aligned to official [Ethereum terminology](https://ethereum.org/en/glossary/)
- Import your Browser Extension, WalletConnect or Private Key Wallet
- Browser native [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt), instead of large BigNumber libraries
- Utilities for working with [ABIs](https://ethereum.org/en/glossary/#abi) (encoding/decoding/inspection)
- TypeScript ready ([infer types](https://viem.sh/docs/typescript) from ABIs and EIP-712 Typed Data)
- First-class support for [Anvil](https://book.getfoundry.sh/), [Hardhat](https://hardhat.org/) & [Ganache](https://trufflesuite.com/ganache/)
- Test suite running against [forked](https://ethereum.org/en/glossary/#fork) Ethereum network

... and a lot lot more.

## Overview

First, see these instructions for spinning up a local devnet. Then install **[@flashbots/suave-viem](https://www.npmjs.com/package/@flashbots/suave-viem)** into your project and run this code:

```ts
import { http, type Hex } from '@flashbots/suave-viem';
import { suaveToliman as suaveChain } from '@flashbots/suave-viem/chains';
import {
  getSuaveProvider,
  getSuaveWallet,
  type TransactionRequestSuave,
  SuaveTxRequestTypes
} from '@flashbots/suave-viem/chains/utils';

// connect to a local SUAVE devnet
const SUAVE_RPC_URL = 'http://localhost:8545';
const suaveProvider = getSuaveProvider(http(SUAVE_RPC_URL));

// instantiate a wallet
const DEFAULT_PRIVATE_KEY: Hex =
  '0x91ab9a7e53c220e6210460b65a7a3bb2ca181412a8a7b43ff336b3df1737ce12';
const wallet = getSuaveWallet({
  transport: http(SUAVE_RPC_URL),
  privateKey: DEFAULT_PRIVATE_KEY,
});

// Watch for pending transactions
suaveProvider.watchPendingTransactions({
  async onTransactions(transactions) {
    for (const hash of transactions) {
      try {
        console.log(
          'Transaction Receipt:',
          await suaveProvider.getTransactionReceipt({hash})
        );
      } catch (error) {
        console.error('Error fetching receipt:', error);
      }
    }
  },
});

// send a confidential compute request
const ccr: TransactionRequestSuave = {
  confidentialInputs:
    '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000fd7b22626c6f636b4e756d626572223a22307830222c22747873223a5b2230786638363538303064383235323038393461646263653931303332643333396338336463653834316336346566643261393232383165653664383230336538383038343032303131386164613038376337386234353663653762343234386237313565353164326465656236343031363032343832333735663130663037396663666637373934383830653731613035373366336364343133396437323037643165316235623263323365353438623061316361636533373034343739656334653939316362356130623661323930225d2c2270657263656e74223a31307d000000',
  kettleAddress: '0xB5fEAfbDD752ad52Afb7e1bD2E40432A485bBB7F', // Address of your local Kettle. Use 0x03493869959C866713C33669cA118E774A30A0E5 if on Rigil.
  to: '0x8f21Fdd6B4f4CacD33151777A46c122797c8BF17',
  gasPrice: 10000000000n, // Gas price for the transaction
  gas: 420000n, // Gas limit for the transaction
  type: SuaveTxRequestTypes.ConfidentialRequest, // (0x43)
  data: '0x236eb5a70000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000010000000000000000000000008f21fdd6b4f4cacd33151777a46c122797c8bf170000000000000000000000000000000000000000000000000000000000000000',
};

const res = await wallet.sendTransaction(ccr);
console.log(`sent ccr! tx hash: ${res}`);
```

See [the docs](https://suave-alpha.flashbots.net/tools/typescript-sdk) and [examples](./examples/) in this repo ([suave](./examples/suave), [suave-web-demo](./examples/suave-web-demo)) for more detailed examples.

## Community

Check out the following places for more viem-related content:

- Follow [@wagmi_sh](https://twitter.com/wagmi_sh), [@jakemoxey](https://twitter.com/jakemoxey), and [@awkweb](https://twitter.com/awkweb) on Twitter for project updates
- Join the [discussions on GitHub](https://github.com/wagmi-dev/viem/discussions)
- [Share your project/organization](https://github.com/wagmi-dev/viem/discussions/104) that uses viem

## Support

- [GitHub Sponsors](https://github.com/sponsors/wagmi-dev?metadata_campaign=docs_support)
- [Gitcoin Grant](https://wagmi.sh/gitcoin)
- [wagmi-dev.eth](https://etherscan.io/enslookup-search?search=wagmi-dev.eth)

## Sponsors

<a href="https://paradigm.xyz">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/paradigm-dark.svg">
    <img alt="paradigm logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/paradigm-light.svg" width="auto" height="70">
  </picture>
</a>

<br>

<a href="https://twitter.com/family">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/family-dark.svg">
    <img alt="family logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/family-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://twitter.com/context">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/context-dark.svg">
    <img alt="context logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/context-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://walletconnect.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/walletconnect-dark.svg">
    <img alt="WalletConnect logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/walletconnect-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://looksrare.org">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/looksrare-dark.svg">
    <img alt="LooksRare logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/8923685e23fe9708b74d456c3f9e7a2b90f6abd9/content/sponsors/looksrare-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://twitter.com/prtyDAO">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/partydao-dark.svg">
    <img alt="PartyDAO logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/partydao-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://dynamic.xyz">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/dynamic-dark.svg">
    <img alt="Dynamic logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/dynamic-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://sushi.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/sushi-dark.svg">
    <img alt="Sushi logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/sushi-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://stripe.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/stripe-dark.svg">
    <img alt="Stripe logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/stripe-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://bitkeep.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/bitkeep-dark.svg">
    <img alt="BitKeep logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/bitkeep-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://privy.io">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/privy-dark.svg">
    <img alt="Privy logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/privy-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://spruceid.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/spruce-dark.svg">
    <img alt="Spruce logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/spruce-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://rollup.id">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/rollup.id-dark.svg">
    <img alt="rollup.id logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/rollup.id-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://pancakeswap.finance/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/pancake-dark.svg">
    <img alt="pancake logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/pancake-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://celo.org/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/celo-dark.svg">
    <img alt="celo logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/celo-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://pimlico.io/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/pimlico-dark.svg">
    <img alt="pimlico logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/pimlico-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://zora.co/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/zora-dark.svg">
    <img alt="zora logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/zora-light.svg" width="auto" height="50">
  </picture>
</a>

## Contributing

If you're interested in contributing, please read the [contributing docs](/.github/CONTRIBUTING.md) **before submitting a pull request**.

## Authors

- [@jxom](https://github.com/jxom) (jxom.eth, [Twitter](https://twitter.com/jakemoxey))
- [@tmm](https://github.com/tmm) (awkweb.eth, [Twitter](https://twitter.com/awkweb))

## License

[MIT](/LICENSE) License
