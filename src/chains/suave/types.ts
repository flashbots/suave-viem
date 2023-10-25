import type { Address } from 'abitype'
import type { Block, BlockTag } from '../../types/block.js'
import type { FeeValuesLegacy } from '../../types/fee.js'
import type { Hash, Hex } from '../../types/misc.js'
import type {
  Index,
  Quantity,
  RpcBlock,
  RpcTransaction as RpcTransaction_,
  RpcTransactionReceipt,
} from '../../types/rpc.js'
import type {
  Transaction as Transaction_,
  TransactionBase,
  TransactionReceipt,
  TransactionRequestBase,
} from '../../types/transaction.js'

export type SuaveBlockOverrides = {} // Add any specific block overrides if necessary for Suave

export type SuaveBlock<
  TIncludeTransactions extends boolean = boolean,
  TBlockTag extends BlockTag = BlockTag,
> = Block<
  bigint,
  TIncludeTransactions,
  TBlockTag,
  SuaveTransaction<TBlockTag extends 'pending' ? true : false>
> &
  SuaveBlockOverrides

export type SuaveRpcBlock<
  TBlockTag extends BlockTag = BlockTag,
  TIncludeTransactions extends boolean = boolean,
> = RpcBlock<TBlockTag, TIncludeTransactions> & SuaveBlockOverrides

export type SuaveTransaction<TPending extends boolean = boolean> = Transaction_<
  bigint,
  number,
  TPending
> & {
  executionNode: Address
  confidentialComputeRequest: ConfidentialComputeRecord
  confidentialComputeResult: Hex
}

export type SuaveRpcTransaction<TPending extends boolean = boolean> =
  | (RpcTransaction_<TPending> & {
      executionNode: Address
      isConfidential?: boolean
      confidentialComputeRequest: RpcTransaction_<TPending>
      confidentialComputeResult: Hex
    })
  | RpcTransactionSuave<TPending>

export type ConfidentialComputeRecord = Transaction_<bigint, number> & {
  executionNode: Address // Assuming address is a string type
  confidentialInputsHash: Hash // This might need to be adjusted to the actual Ethereum Transaction type
}

export type SuaveTransactionRequest<
  TQuantity = bigint,
  TIndex = number,
  TTransactionType = 'suave',
> = TransactionRequestBase<TQuantity, TIndex> &
  Partial<FeeValuesLegacy<TQuantity>> & {
    accessList?: never
    type?: TTransactionType
    executionNode?: Address
    confidentialInputs?: Hex
  }

export type SuaveRpcTransactionRequest<
  TQuantity = Hex,
  TIndex = Hex,
> = TransactionRequestBase<TQuantity, TIndex> &
  Partial<FeeValuesLegacy<TQuantity>> & {
    executionNode?: Address
    isConfidential?: boolean
    confidentialComputeRequest: ConfidentialComputeRecord
  }

export type SuaveTransactionReceiptOverrides = {
  executionNode: Address | null
  confidentialComputeRequest: ConfidentialComputeRecord | null
  confidentialComputeResult: Hex | null
}

export type SuaveTransactionReceipt = TransactionReceipt &
  SuaveTransactionReceiptOverrides

type RpcTransactionSuave<TPending extends boolean = boolean> = TransactionBase<
  Quantity,
  Index,
  TPending
> & {
  executionNode: Address
  confidentialComputeRequest: RpcTransaction_<TPending>
  confidentialComputeResult: Hex
  isConfidential?: boolean
}

export type SuaveRpcTransactionReceipt = RpcTransactionReceipt & {
  executionNode: Address
  confidentialComputeRequest: RpcTransaction_
  confidentialComputeResult: Hex
}

// Serializable Suave transactions.
// Returned from RPC calls.
export type SuaveTransactionSerializable = {
  chainId: bigint
  nonce: bigint
  gas: bigint
  to: Address
  value: bigint
  data: Hex
  executionNode: Address
  confidentialComputeRequest: {
    executionNode: Address
    wrapped: { toHex: () => Hex } // Adjust this type as necessary
    // ... other fields
  }
  ConfidentialComputeResult: Hex
}

// Define a type for serialized Suave transactions
export type TransactionSerializedSuave = Hex
