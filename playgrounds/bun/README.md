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

Forge will install the required solidity dependencies into `playgrounds/bun/contracts/lib/`.

```sh
# from playgrounds/bun/contracts/

forge install
forge build
```

## deploy contracts

We use a forge script to deploy our contracts. Normally we'd use `forge create` for this but because we rely on (deeply-nested) suave-geth contracts, this is a bit cleaner.

```sh
# from playgrounds/bun/contracts/

# do a dry run to see that your dependencies are set up correctly:
forge script DeployContracts

# populate environment vars using this project's .env file
source ../.env

# send real deployment transactions with the --broadcast flag
forge script --broadcast --rpc-url $RPC_URL_HTTP --private-key $PRIVATE_KEY DeployContracts
```
