# suave-web-demo

Simple Vanilla JS web app that sends a mev-share bid to suave.

## setup

> This project requires a local suave-geth devnet to be running. See [instructions here](https://github.com/flashbots/suave-geth/tree/main?tab=readme-ov-file#starting-a-local-devnet) to spin one up.

Start by building the library:

```sh
# in project root (suave-viem/)
bun install
bun run build
```

Next, go to the [suave example](../suave/) and run `./deployContracts.sh`:

```sh
cd ../suave
./deployContracts.sh
cd -
```

Next, install the project's dependencies.

```sh
bun install
```

Finally, run the webserver:

```sh
bun dev
```
