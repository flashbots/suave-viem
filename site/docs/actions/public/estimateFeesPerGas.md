---
head:
  - - meta
    - property: og:title
      content: estimateFeesPerGas
  - - meta
    - name: description
      content: Returns an estimate for the fees per gas (in wei) for a transaction to be likely included in the next block.
  - - meta
    - property: og:description
      content: Returns an estimate for the fees per gas (in wei) for a transaction to be likely included in the next block.

---

# estimateFeesPerGas

Returns an estimate for the fees per gas (in wei) for a transaction to be likely included in the next block.

If [`chain.fees.estimateFeesPerGas`](/docs/actions/public/estimateFeesPerGas) is set on the [Client Chain](/docs/clients/public.html#chain-optional) or [override Chain](#chain-optional), it will use the returned value.

Otherwise, for EIP-1159 Transactions, viem will estimate the fees using a combination of the block's base fee per gas (to derive `maxFeePerGas`) + the [`estimateMaxPriorityFeePerGas` Action](/docs/actions/public/estimateMaxPriorityFeePerGas.html) (to derive `maxPriorityFeePerGas`). For Legacy Transactions, viem will estimate the fee based on the gas price (via the [`getGasPrice` Action](/docs/actions/public/getGasPrice.html)).

## Usage

::: code-group

```ts [example.ts]
import { publicClient } from './client'

const {
  maxFeePerGas,
  maxPriorityFeePerGas
} = await publicClient.estimateFeesPerGas()
/**
 * {
 *   maxFeePerGas: 15_000_000_000n,
 *   maxPriorityFeePerGas: 1_000_000_000n,
 * }
 */

const { gasPrice } = await publicClient.estimateFeesPerGas({
  type: 'legacy'
})
/** 
 * { gasPrice: 15_000_000_000n } 
 */
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

[`FeeValues`](/docs/glossary/types#feevalues)

An estimate (in wei) for the fees per gas.

## Parameters

### chain (optional)

- **Type:** [Chain](/docs/glossary/types#chain)
- **Default:** [`client.chain`](/docs/clients/public.html#chain-optional)

Optional Chain override. Used to infer the fees per gas from [`chain.fees.estimateFeesPerGas`](/docs/actions/public/estimateFeesPerGas).

```ts
import { optimism } from 'viem/chains' // [!code focus]

const { maxFeePerGas, maxPriorityFeePerGas } = 
  await publicClient.estimateFeesPerGas({
    chain: optimism // [!code focus]
  })
```

### type (optional)

- **Type:** `"legacy" | "eip1559"`
- **Default:** `"eip1559"`

```ts
const { gasPrice } = await publicClient.estimateFeesPerGas({
  type: 'legacy' // [!code focus]
})
```
