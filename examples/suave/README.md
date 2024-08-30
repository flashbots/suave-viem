# suave example

This example assumes you're running a suave-geth devnet instance locally. See [suave docs](https://suave-alpha.flashbots.net/tutorials/run-suave) for instructions.

## setup environment

Use a .env file or populate your shell's environment with the variables in `.env.example`.

```sh
cp .env.example .env
# optional: use your favorite editor to modify
vim .env
```

Note: a `.env` file will take precedence over variables set in your environment, such as this:

```sh
export PRIVATE_KEY=0x91ab9a7e53c220e6210460b65a7a3bb2ca181412a8a7b43ff336b3df1737ce12
```

## deploy contracts

We use a bash script to deploy our contracts and save the address for use in other examples.

```sh
./deployContracts.sh
```

## run example

```bash
bun run index.ts
```
