---
head:
  - - meta
    - property: og:title
      content: Types
  - - meta
    - name: description
      content: Glossary of Types in viem.
  - - meta
    - property: og:description
      content: Glossary of Types in viem.

---

# Types

## `Abi`

Type matching the [Contract ABI Specification](https://docs.soliditylang.org/en/latest/abi-spec.html#json)

Re-exported from [ABIType](https://abitype.dev/api/types.html#abi).

## `AbiError`

ABI [Error](https://docs.soliditylang.org/en/latest/abi-spec.html#errors) type.

Re-exported from [ABIType](https://abitype.dev/api/types.html#abierror).

## `AbiEvent`

ABI [Event](https://docs.soliditylang.org/en/latest/abi-spec.html#events) type.

Re-exported from [ABIType](https://abitype.dev/api/types.html#abievent).

## `AbiFunction`

ABI [Function](https://docs.soliditylang.org/en/latest/abi-spec.html#argument-encoding) type.

Re-exported from [ABIType](https://abitype.dev/api/types.html#abifunction).

## `AbiParameter`

`inputs` and `ouputs` item for ABI functions, events, and errors.

Re-exported from [ABIType](https://abitype.dev/api/types.html#abiparameter).

## `AbiParameterToPrimitiveTypes`

Converts `AbiParameter` to corresponding TypeScript primitive type.

[See more](https://abitype.dev/api/utilities.html#abiparametertoprimitivetype)

## `AbiParametersToPrimitiveTypes`

Converts array of `AbiParameter` to corresponding TypeScript primitive types.

[See more](https://abitype.dev/api/utilities.html#abiparameterstoprimitivetypes)

## `AccessList`

An access list.

## `Address`

An address.

Re-exported from [ABIType](https://abitype.dev/api/types.html#address).

## `Block`

A type for a [Block](/docs/glossary/terms#block).

[See Type](https://github.com/wagmi-dev/viem/blob/main/src/types/block.ts)

## `Chain`

A type for a [Chain](/docs/glossary/terms#chain).

[See Type](https://github.com/wagmi-dev/viem/blob/main/src/types/chain.ts)

## `CompactSignature`

A type for [EIP-2098](https://eips.ethereum.org/EIPS/eip-2098) compact signatures.

[See Type](https://github.com/wagmi-dev/viem/blob/main/src/types/misc.ts)

## `FeeHistory`

A type for fee history.

[See Type](https://github.com/wagmi-dev/viem/blob/main/src/types/fee.ts)

## `FeeValues`

A type for fee values.

[See Type](https://github.com/wagmi-dev/viem/blob/main/src/types/fee.ts)

## `Filter`

A type for a [Filter](/docs/glossary/terms#filter).

[See Type](https://github.com/wagmi-dev/viem/blob/main/src/types/filter.ts)

## `Hash`

Type for a hashed value – a "0x"-prefixed string: `"0x${string}"`

## `Hex`

Type for a hex value – a "0x"-prefixed string: `"0x${string}"`

## `Log`

A type for [Event Logs](/docs/glossary/terms#event-log).

[See Type](https://github.com/wagmi-dev/viem/blob/main/src/types/log.ts)

## `Signature`

A type for a structured signature.

[See Type](https://github.com/wagmi-dev/viem/blob/main/src/types/misc.ts)

## `Transaction`

A type for [Transactions](/docs/glossary/terms#transaction).

[See Type](https://github.com/wagmi-dev/viem/blob/main/src/types/transaction.ts)

## `TransactionReceipt`

A type for [Transaction Receipts](/docs/glossary/terms#transaction-receipt).

[See Type](https://github.com/wagmi-dev/viem/blob/main/src/types/transaction.ts)

## `Transport`

A type for [Transports](/docs/glossary/terms#transports).

[See Type](https://github.com/wagmi-dev/viem/blob/main/src/clients/transports/createTransport.ts)

## `WalletPermission`

A type for wallet (JSON-RPC Account) permissions.

[See Type](https://github.com/wagmi-dev/viem/blob/main/src/types/eip1193.ts)

## `TransactionSerializedEIP1559`

EIP-1559 transaction hex value – a "0x02"-prefixed string: `"0x02${string}"`

## `TransactionSerializedEIP2930`

EIP-2930 transaction hex value – a "0x01"-prefixed string: `"0x01${string}"`

## `TransactionSerializedLegacy`

Legacy transaction hex value – a "0x"-prefixed string: `"0x${string}"`

## `TransactionType`

All types of transactions. `"eip1559" | "eip2930" | "legacy"`

## `TransactionRequest`

A type for all transaction requests.

[See Type](https://github.com/wagmi-dev/viem/blob/main/src/types/transaction.ts).
