---
head:
  - - meta
    - property: og:title
      content: getBlockNumber
  - - meta
    - name: description
      content: Returns the number of the most recent block seen.
  - - meta
    - property: og:description
      content: Returns the number of the most recent block seen.

---

# getBlockNumber

Returns the number of the most recent block seen.

## Usage

::: code-group

```ts [example.ts]
import { publicClient } from './client'

const block = await publicClient.getBlockNumber() // [!code focus:99]
// 69420n
```

```ts [client.ts]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

## Returns

`bigint`

The number of the block.

## Parameters

### cacheTime (optional)

- **Type:** `number`
- **Default:** [Client's `cacheTime`](/docs/clients/public#cachetime-optional)

Time (in ms) that cached block number will remain in memory.

```ts
const block = await publicClient.getBlockNumber({
  cacheTime: 4_000 // [!code focus]
})
```

By default, block numbers are cached for the period of the [Client's `cacheTime`](/docs/clients/public#cacheTime-optional).

- Setting a value of above zero will make block number remain in the cache for that period.
- Setting a value of `0` will disable the cache, and always retrieve a fresh block number.

## Example

Check out the usage of `getBlockNumber` in the live [Fetching Blocks Example](https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/blocks_fetching-blocks) below.

<iframe frameborder="0" width="100%" height="500px" src="https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/blocks_fetching-blocks?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>

## JSON-RPC Method

[`eth_blockNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_blocknumber)
