import type { Address } from 'abitype'
import type { Block, BlockTag } from '../../types/block.js'
import type { FeeValuesLegacy } from '../../types/fee.js'
import type { Hash, Hex } from '../../types/misc.js'
import type { RpcBlock, RpcTransactionReceipt } from '../../types/rpc.js'
import type {
  TransactionBase,
  TransactionReceipt,
  TransactionRequestBase,
} from '../../types/transaction.js'

export const TX_TYPE = {
  suave: '0x50',
  confidentialRecord: '0x42',
}

type SuaveTxType = '0x50'
type ConfidentialRecordTxType = '0x42'

type TransactionCore<
  TQuantity,
  TIndex,
  TType,
  TPending extends boolean,
> = TransactionBase<TQuantity, TIndex, TPending> &
  FeeValuesLegacy<TQuantity> & {
    accessList?: never
    chainId?: TIndex
    type: TType
  }

type RpcTransaction<TPending extends boolean = boolean> = TransactionCore<
  Hex,
  Hex,
  Hex,
  TPending
>

type TransactionRequestCore<TQuantity, TIndex, TType> = TransactionRequestBase<
  TQuantity,
  TIndex
> &
  FeeValuesLegacy<TQuantity> & {
    accessList?: never
    chainId?: TIndex
    type: TType
  }

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
> = TransactionCore<bigint, number, TType, TPending> & {
  executionNode: Address
  requestRecord: ConfidentialComputeRecord
  confidentialComputeResult: Hex
  type: TType
}

export type SuaveRpcTransaction<TPending extends boolean = boolean> =
  | RpcTransactionSuave<TPending>
  | RpcTransaction<TPending>

export type RpcTransactionSuave<
  TPending extends boolean = boolean,
  TType = SuaveTxType,
> = RpcTransaction<TPending> & {
  executionNode: Address
  requestRecord: ConfidentialComputeRecordRpc
  confidentialComputeResult: Hex
  type: TType
}

export type ConfidentialComputeRecord<
  TType = 'confidentialRecord',
  TPending extends boolean = true,
> = Omit<
  Omit<
    Omit<TransactionCore<bigint, number, TType, TPending>, 'blockHash'>,
    'transactionIndex'
  >,
  'blockNumber'
> & {
  executionNode: Address // Assuming address is a string type
  confidentialInputsHash: Hash // This might need to be adjusted to the actual Ethereum Transaction type
  type: TType
}

export type ConfidentialComputeRecordRpc<
  TType = ConfidentialRecordTxType,
  TPending extends boolean = true,
> = Omit<
  Omit<
    Omit<
      Omit<TransactionCore<Hex, Hex, TType, TPending>, 'blockHash'>,
      'typeHex'
    >,
    'transactionIndex'
  >,
  'blockNumber'
> & {
  executionNode: Address // Assuming address is a string type
  confidentialInputsHash: Hash // This might need to be adjusted to the actual Ethereum Transaction type
  type: TType
}

export type SuaveTransactionRequest<
  TQuantity = bigint,
  TIndex = number,
  TTransactionType = 'suave',
> = TransactionRequestCore<TQuantity, TIndex, TTransactionType> & {
  accessList?: never
  type?: TTransactionType
  executionNode?: Address
  confidentialInputs?: Hex
}

export type SuaveRpcTransactionRequest<
  TQuantity = Hex,
  TIndex = Hex,
  TTransactionType = SuaveTxType,
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

export type SuaveTransactionSerializable = RpcTransaction & {
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
