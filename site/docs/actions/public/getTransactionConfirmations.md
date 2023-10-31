---
head:
  - - meta
    - property: og:title
      content: getTransactionConfirmations
  - - meta
    - name: description
      content: Returns the number of blocks passed (confirmations) since the transaction was processed on a block.
  - - meta
    - property: og:description
      content: Returns the number of blocks passed (confirmations) since the transaction was processed on a block.

---

# getTransactionConfirmations

Returns the number of blocks passed (confirmations) since the transaction was processed on a block.

## Usage

::: code-group

```ts [example.ts]
import { publicClient } from './client'

const transactionReceipt = await publicClient.getTransactionReceipt({ hash: '...' })
const confirmations = await publicClient.getTransactionConfirmations({  // [!code focus:99]
  transactionReceipt
})
// 15n
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

You can also fetch confirmations by Transaction hash:

::: code-group

```ts [example.ts]
import { publicClient } from './client'

const confirmations = await publicClient.getTransactionConfirmations({  // [!code focus:99]
  hash: '0x...'
})
// 15n
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

The number of blocks passed since the transaction was processed. If confirmations is `0`, then the Transaction has not been confirmed & processed yet.

## Parameters

### transactionReceipt

- **Type:** [`TransactionReceipt`](/docs/glossary/types#transactionreceipt)

The transaction receipt.

```ts
const balance = await publicClient.getTransactionConfirmations({
  transactionReceipt: { ... }, // [!code focus]
})
```

### hash

- **Type:** [`Hash`](/docs/glossary/types#hash)

The hash of the transaction.

```ts
const balance = await publicClient.getTransactionConfirmations({
  hash: '0x...'  // [!code focus]
})
```

## Example

Check out the usage of `getTransactionConfirmations` in the live [Fetching Transactions Example](https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/transactions_fetching-transactions) below.

<iframe frameborder="0" width="100%" height="500px" src="https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/transactions_fetching-transactions?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>

## JSON-RPC Method

[`eth_getTransactionConfirmations`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionConfirmations)
