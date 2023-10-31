# Contributing

Thanks for your interest in contributing to viem! Please take a moment to review this document **before submitting a pull request.**

If you want to contribute, but aren't sure where to start, you can create a [new discussion](https://github.com/wagmi-dev/viem/discussions).

If you are contributing to add a new chain to `viem/chains`, please read the [Chains section](#chains).

> **Note**
>
> **Please ask first before starting work on any significant new features.**
>
> It's never a fun experience to have your pull request declined after investing time and effort into a new feature. To avoid this from happening, we request that contributors create a [feature request](https://github.com/wagmi-dev/viem/discussions/new?category=ideas) to first discuss any API changes or significant new ideas.

<br>

## Basic guide

This guide is intended to help you get started with contributing. By following these steps, you will understand the development process and workflow.

1. [Cloning the repository](#cloning-the-repository)
2. [Installing Node.js and Bun](#installing-nodejs-and-bun)
3. [Installing Foundry](#installing-foundry)
4. [Installing dependencies](#installing-dependencies)
5. [Running the test suite](#running-the-test-suite)
6. [Writing documentation](#writing-documentation)
7. [Submitting a pull request](#submitting-a-pull-request)
8. [Versioning](#versioning)

---

### Cloning the repository

To start contributing to the project, clone it to your local machine using git:

```bash
git clone https://github.com/wagmi-dev/viem.git --recurse-submodules
```

Or the [GitHub CLI](https://cli.github.com):

```bash
gh repo clone wagmi-dev/viem -- --recurse-submodules
```

<div align="right">
  <a href="#basic-guide">&uarr; back to top</a></b>
</div>

---

### Installing Node.js and Bun

wagmi uses [Bun workspaces](https://bun.sh/docs/install/workspaces) to manage multiple projects. You need to install **Node.js v18 or higher** and **Bun v1 or higher**.

You can run the following commands in your terminal to check your local Node.js and Bun versions:

```bash
node -v
bun -v
```

If the versions are not correct or you don't have Node.js or Bun installed, download and follow their setup instructions:

- Install Node.js using [fnm](https://github.com/Schniz/fnm) or from the [official website](https://nodejs.org)
- Install [Bun](https://bun.sh/docs/installation)

<div align="right">
  <a href="#basic-guide">&uarr; back to top</a></b>
</div>

---

### Installing Foundry

viem uses [Foundry](https://book.getfoundry.sh/) for testing. We run a local [Anvil](https://github.com/foundry-rs/foundry/tree/master/anvil) instance against a forked Ethereum node, where we can also use tools like [Forge](https://book.getfoundry.sh/forge/) to deploy test contracts to it.

Install Foundry using the following command:

```bash
curl -L https://foundry.paradigm.xyz | bash
```

<div align="right">
  <a href="#basic-guide">&uarr; back to top</a></b>
</div>

---

### Installing dependencies

Once in the project's root directory, run the following command to install the project's dependencies:

```bash
bun install
```

After the install completes, Bun links packages across the project for development and [git hooks](https://github.com/toplenboren/simple-git-hooks) are set up.

<div align="right">
  <a href="#basic-guide">&uarr; back to top</a></b>
</div>

---

### Running the test suite

First, add the following to your environment (recommended to use [`direnv`](https://github.com/direnv/direnv)):

```bash
VITE_ANVIL_FORK_URL=https://rpc
VITE_ANVIL_BLOCK_TIME=1
VITE_ANVIL_BLOCK_NUMBER=16280770
VITE_NETWORK_TRANSPORT_MODE=http
```

`VITE_ANVIL_FORK_URL` can be for any RPC service provider (e.g. Alchemy or Infura) for the mainnet. Now you are ready to run the tests!

- `bun run test` — runs tests in watch mode

Sometimes there may be some tests which fail unexpectedly – you can press `f` to rerun them and they should pass.

When adding new features or fixing bugs, it's important to add test cases to cover the new/updated behavior.

<div align="right">
  <a href="#basic-guide">&uarr; back to top</a></b>
</div>

---

### Writing documentation

Documentation is crucial to helping developers of all experience levels use viem. viem uses [VitePress](https://github.com/vuejs/vitepress) and Markdown for the documentation site (located at [`site`](../site)). To start the site in dev mode, run:

```bash
bun run dev:docs
```

Try to keep documentation brief and use plain language so folks of all experience levels can understand. If you think something is unclear or could be explained better, you are welcome to open a pull request.

<div align="right">
  <a href="#basic-guide">&uarr; back to top</a></b>
</div>

---

### Submitting a pull request

When you're ready to submit a pull request, you can follow these naming conventions:

- Pull request titles use the [Imperative Mood](https://en.wikipedia.org/wiki/Imperative_mood) (e.g., `Add something`, `Fix something`).
- [Changesets](#versioning) use past tense verbs (e.g., `Added something`, `Fixed something`).

When you submit a pull request, GitHub will automatically lint, build, and test your changes. If you see an ❌, it's most likely a bug in your code. Please, inspect the logs through the GitHub UI to find the cause.

<div align="right">
  <a href="#basic-guide">&uarr; back to top</a></b>
</div>

---

### Versioning

When adding new features or fixing bugs, we'll need to bump the package versions. We use [Changesets](https://github.com/changesets/changesets) to do this.

> **Note**
>
> Only changes to the codebase that affect the public API or existing behavior (e.g. bugs) need changesets.

Each changeset defines which package(s) should be published and whether the change should be a major/minor/patch release, as well as providing release notes that will be added to the changelog upon release.

To create a new changeset, run `bun run changeset`. This will run the Changesets CLI, prompting you for details about the change. You’ll be able to edit the file after it’s created — don’t worry about getting everything perfect up front.

Even though you can technically use any markdown formatting you like, headings should be avoided since each changeset will ultimately be nested within a bullet list. Instead, bold text should be used as section headings.

If your PR is making changes to an area that already has a changeset (e.g. there’s an existing changeset covering theme API changes but you’re making further changes to the same API), you should update the existing changeset in your PR rather than creating a new one.

---

<br>

<div>
  ✅ Now you're ready to contribute to viem!
</div>

<div align="right">
  <a href="#advanced-guide">&uarr; back to top</a></b>
</div>

---

## Chains

If you wish to contribute to add an additional Chain to the `viem/chains` entrypoint, there are a few requirements to note before submitting a pull request.

### Requirements

- **Must haves**:
  - a unique Chain ID (`id`),
  - a human-readable name (`name`),
  - an internal network label (`network`),
  - a native currency reference (`nativeCurrency`),
  - a public, credible RPC URL (`rpcUrls.default` & `rpcUrls.public`)
- **Nice to haves**
  - a block explorer (`blockExplorers`)
  - a [multicall3](https://www.multicall3.com/) contract (`contracts.multicall3`)
    - this contract **must** be verified, and **must** match the bytecode of the [multicall3 contract](https://etherscan.io/address/0xca11bde05977b3631167028862be2a173976ca11#code).
- **Optional**
  - other named RPC URLs (such as `rpcUrls.alchemy`, `rpcUrls.infura`, etc.)
  - ENS registry contract (`contracts.ensRegistry`)
  - testnet flag (`testnet`)

If your Chain satisfies the necessary criteria, you may submit a pull request for consideration. If your pull request does not satisfy the criteria, it will be closed.

### Attribute reference

The [`Chain` type](../src/types/chain.ts) has a number of important attributes, and you may get stuck on what to add to these. Most of these attributes exist within the [`ethereum-lists/chains` repository](https://github.com/ethereum-lists/chains/tree/3fbd4eeac7ce116579634bd042b84e2b1d89886a/_data/chains).

- `id`: The Chain ID for the network. This can be found by typing the network name into [ChainList](https://chainlist.org/). Example: "Ethereum Mainnet" has a Chain ID of `1`.
- `name`: A human readable name for the network. Example: "Binance Smart Chain Mainnet"
- `network`: An internal network label. Example: "bsc"
- `nativeCurrency`: The native currently of the network. Found from [`ethereum-lists/chains`](https://github.com/ethereum-lists/chains/blob/3fbd4eeac7ce116579634bd042b84e2b1d89886a/_data/chains/eip155-56.json#L20-L24).
- `rpcUrls`: A set of RPC URLs for the chain. Found from [`ethereum-lists/chains`](https://github.com/ethereum-lists/chains/blob/3fbd4eeac7ce116579634bd042b84e2b1d89886a/_data/chains/eip155-56.json#L4-L18).
- `blockExplorers`: A set of block explorers for the chain. Found from [`ethereum-lists/chains`](https://github.com/ethereum-lists/chains/blob/3fbd4eeac7ce116579634bd042b84e2b1d89886a/_data/chains/eip155-56.json#L30-L36).
- `contracts`: A set of deployed contracts for the Chain.
  - `multicall3` is optional, but it's address is most likely `0xca11bde05977b3631167028862be2a173976ca11` – you can find the deployed block number on the block explorer. Found from [`mds1/multicall`](https://github.com/mds1/multicall#multicall3-contract-addresses).
  - `ensRegistry` is optional – not all Chains have an ENS Registry. See [ENS Deployments](https://docs.ens.domains/ens-deployments) for more info.
  - `ensUniversalResolver` is optional – not all Chains have an ENS Universal Resolver.
- `testnet`: Whether or not the Chain is a testnet.

### Adding a chain

#### 1. Read the contributing guide

Read the [Basic Guide](#basic-guide) to contributing to set up your environment.

#### 2. Create a chain file

Create a file for your chain in [`src/chains/definitions/`](../src/chains/definitions/).

Example:

```diff

 src/
 ├─ chains/
 │  ├─ definitions/
 │  │  ├─ avalanche.ts
 │  │  ├─ ...
+│  │  ├─ example.ts
 │  │  ├─ ...
 │  │  ├─ zora.ts
 │  ├─ index.ts
```

#### 3. Define your chain

Define your chain data in `defineChain`.

Example:

```ts
// src/chains/definitions/example.ts
import { defineChain } from '../../utils/chain.js'

export const mainnet = /*#__PURE__*/ defineChain({
  id: 1,
  network: 'example',
  name: 'Example Chain',
  nativeCurrency: { name: 'Example', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://example.com'],
    },
    public: {
      http: ['https://example.com'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
    },
    default: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 69420,
    },
  },
})
```

#### 4. Export your chain

Export the chain in [`src/chains/index.ts`](../src/chains/index.ts).

Example:

```diff
export type { Chain } from '../types/chain.js'

export { arbitrum } from './definitions/arbitrum.js'
...
+export { example } from './definitions/example.js'
...
export { zora } from './definitions/zora.js'
```

#### 4. Add changeset

Add a `patch` changeset with the description `"Added <your chain here> chain."`.

```diff
> bun run changeset

What kind of change is this for viem?
+ patch

Please enter a summary for this change
+ Added Example chain.
```

#### 5. Open your PR

Now you are ready to open your Pull Request.

---

<div align="right">
  <a href="#advanced-guide">&uarr; back to top</a></b>
</div>
