# suave example

## build contracts

Forge will install the required solidity dependencies into `examples/suave/contracts/lib/`.

```sh
# from examples/suave/contracts/

forge install
forge build
```

## deploy contracts

We use a forge script to deploy our contracts. Normally we'd use `forge create` for this but because we rely on (deeply-nested) suave-geth contracts, this is a bit cleaner.

```sh
# from examples/suave/contracts/

# do a dry run to see that your dependencies are set up correctly:
forge script DeployContracts

# populate environment vars using this project's .env file
source ../.env

# send real deployment transactions with the --broadcast flag
forge script --broadcast --rpc-url $RPC_URL_HTTP --private-key $PRIVATE_KEY DeployContracts
```

Then populate your .env file with the new bid contract address.

```sh
# from examples/suave/contracts/
echo "BID_CONTRACT_ADDRESS=$(cat broadcast/Deploy.s.sol/16813125/run-latest.json | jq -r '.receipts[0].contractAddress')" >> ../.env
```

## run example

```bash
bun run index.ts
```
