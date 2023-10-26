import type { Address } from 'abitype'
import type { Block, BlockTag } from '../../types/block.js'
import type { FeeValuesLegacy } from '../../types/fee.js'
import type { Hash, Hex } from '../../types/misc.js'
import type { RpcBlock, RpcTransactionReceipt } from '../../types/rpc.js'
import type {
  TransactionBase,
  TransactionLegacy,
  TransactionReceipt,
  TransactionRequestBase,
} from '../../types/transaction.js'

type RpcTransaction<TPending extends boolean = boolean> = TransactionBase<
  Hex,
  Hex,
  TPending
> &
  FeeValuesLegacy<Hex>

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

export type SuaveTransaction<
  TPending extends boolean = boolean,
  TType = 'suave',
> = TransactionBase<bigint, number, TPending> &
  FeeValuesLegacy<bigint> & {
    executionNode: Address
    confidentialComputeRequest: ConfidentialComputeRecord
    confidentialComputeResult: Hex
    type: TType
  }

export type SuaveRpcTransaction<TPending extends boolean = boolean> =
  | RpcTransactionSuave<TPending>
  | RpcTransaction<TPending>

export type RpcTransactionSuave<TPending extends boolean = boolean> =
  TransactionBase<Hex, Hex, TPending> &
    FeeValuesLegacy<Hex> & {
      executionNode: Address
      confidentialComputeRequest: RpcTransaction<TPending>
      confidentialComputeResult: Hex
      isConfidential: boolean
    }

export type ConfidentialComputeRecord = TransactionBase<bigint, number> &
  FeeValuesLegacy<bigint> & {
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
  TTransactionType = Hex,
> = TransactionRequestBase<TQuantity, TIndex> &
  Partial<FeeValuesLegacy<TQuantity>> & {
    executionNode?: Address
    isConfidential?: boolean
    confidentialInputs: Hex
    type?: TTransactionType
  }

export type SuaveTransactionReceiptOverrides = {
  executionNode: Address | null
  confidentialComputeRequest: ConfidentialComputeRecord | null
  confidentialComputeResult: Hex | null
}

export type SuaveTransactionReceipt = TransactionReceipt &
  SuaveTransactionReceiptOverrides

export type SuaveRpcTransactionReceipt = RpcTransactionReceipt & {
  executionNode: Address
  confidentialComputeRequest: RpcTransaction
  confidentialComputeResult: Hex
}

export type SuaveTransactionSerializable = TransactionLegacy & {
  /// data is an alias for input
  data: Hex
  executionNode: Address
  confidentialInputsHash: Hash
  confidentialInputs: Hex
  requestRecord: ConfidentialComputeRecord
  confidentialComputeResult: Hex
}

// Define a type for serialized Suave transactions
export type TransactionSerializedSuave = Hex
