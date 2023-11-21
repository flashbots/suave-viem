# bun

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v0.5.6. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## build contracts

Forge will install the required solidity dependencies from suave-geth.

```sh
# from playgrounds/bun/contracts/

forge install
forge build
```

## deploy contracts

We have a forge script to deploy contracts:

```sh
# from playgrounds/bun/contracts/

# populate environment vars using this project's .env file
source ../.env
forge script --broadcast --rpc-url $RPC_URL_HTTP --private-key $PRIVATE_KEY script/Deploy.s.sol
```
