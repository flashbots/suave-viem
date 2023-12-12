# suave example

## setup .env

```sh
cp .env.example .env
# optional: use your favorite editor to modify
vim .env
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
