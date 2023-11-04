import type { Address } from 'abitype'
import type { Block, BlockTag } from '../../types/block.js'
import type { FeeValuesLegacy } from '../../types/fee.js'
import type { Hash, Hex } from '../../types/misc.js'
import type { RpcTransactionReceipt } from '../../types/rpc.js'
import type {
  AccessList,
  TransactionBase as TransactionBase_,
  TransactionReceipt,
  TransactionRequestBase as TransactionRequestBase_,
  TransactionSerializableBase,
} from '../../types/transaction.js'

export enum SuaveTxTypes {
  ConfidentialRecord = '0x42',
  ConfidentialRequest = '0x43',
  Suave = '0x50',
}

export type SuaveTxType = '0x0' | `${SuaveTxTypes}`

type FeeValues<TQuantity> = FeeValuesLegacy<TQuantity>

type TransactionBase<
  TQuantity,
  TIndex,
  TType,
  TPending extends boolean,
> = TransactionBase_<TQuantity, TIndex, TPending> &
  FeeValues<TQuantity> & {
    accessList?: AccessList
    chainId: TIndex
    type: TType
  }

type TransactionRequestBase<TQuantity, TIndex, TType> = Omit<
  TransactionRequestBase_<TQuantity, TIndex>,
  'from'
> &
  FeeValues<TQuantity> & {
    accessList?: AccessList
    chainId: TIndex
    type: TType
  }

export type SuaveBlockOverrides = {} // Add any specific block overrides if necessary for Suave

export type SuaveBlock<
  TIncludeTransactions extends boolean = boolean,
  TBlockTag extends BlockTag = BlockTag,
  TQuantity = bigint,
  TIndex = number,
> = Omit<
  Block<
    TQuantity,
    TIncludeTransactions,
    TBlockTag,
    TransactionSuave<
      TBlockTag extends 'pending' ? true : false,
      SuaveTxType,
      TQuantity,
      TIndex
    >
  >,
  'sealFields'
> &
  SuaveBlockOverrides

export type SuaveRpcBlock<
  TBlockTag extends BlockTag = BlockTag,
  TIncludeTransactions extends boolean = boolean,
> = SuaveBlock<TIncludeTransactions, TBlockTag, Hex, Hex>

export type TransactionSuave<
  TPending extends boolean = boolean,
  TType extends SuaveTxType = SuaveTxType,
  TQuantity = bigint,
  TIndex = number,
> = TransactionBase<TQuantity, TIndex, TType, TPending> & {
  executionNode: Address
  requestRecord: ConfidentialComputeRecord<TPending, TQuantity, TIndex>
  confidentialComputeResult: Hex
  type: TType
}

/** The type that interfaces with RPC endpoints.
 * Used for endpoints that returns transactions, such as `eth_getTransactionByHash`.
 * Also used when parsing transactions from this client before sending to RPC endpoints
 * and/or signing transactions.
 */
export type RpcTransactionSuave<
  TType extends SuaveTxType,
  TPending extends boolean = boolean,
> = TransactionSuave<TPending, TType, Hex, Hex> & {
  executionNode: Address
  requestRecord: ConfidentialComputeRecord<TPending, Hex, Hex>
  confidentialComputeResult: Hex
}

export type ConfidentialComputeRecord<
  TPending extends boolean = false,
  TQuantity = bigint,
  TIndex = number,
> = Omit<
  Omit<
    Omit<
      Omit<
        TransactionBase<
          TQuantity,
          TIndex,
          SuaveTxTypes.ConfidentialRecord,
          TPending
        >,
        'blockHash'
      >,
      'transactionIndex'
    >,
    'blockNumber'
  >,
  'from'
> & {
  executionNode: Address // Assuming address is a string type
  confidentialInputsHash: Hash // This might need to be adjusted to the actual Ethereum Transaction type
  type: SuaveTxTypes.ConfidentialRecord
}

export type ConfidentialComputeRecordRpc<TPending extends boolean = false> =
  ConfidentialComputeRecord<TPending, Hex, Hex>

export type TransactionRequestSuave<
  TQuantity = bigint,
  TIndex = number,
  TType extends SuaveTxType =
    | SuaveTxTypes.ConfidentialRequest
    | SuaveTxTypes.ConfidentialRecord
    | '0x0',
> = TransactionRequestBase<TQuantity, TIndex, TType> & {
  accessList?: AccessList
  type: TType
  from?: Address
  executionNode?: Address
  confidentialInputs?: Hex
}

export type RpcTransactionRequestSuave<
  TQuantity = Hex,
  TIndex = Hex,
  TType extends SuaveTxType = SuaveTxTypes.ConfidentialRequest,
> = TransactionRequestBase<TQuantity, TIndex, TType> &
  FeeValues<TQuantity> & {
    executionNode?: Address
    isConfidential?: boolean
    confidentialInputs: Hex
    type?: TType
  }

export type SuaveTransactionReceiptOverrides = {
  executionNode: Address | null
  confidentialComputeRequest: ConfidentialComputeRecord | null
  confidentialComputeResult: Hex | null
}

export type TransactionReceiptSuave = TransactionReceipt &
  SuaveTransactionReceiptOverrides

export type RpcTransactionReceiptSuave = RpcTransactionReceipt & {}

/// Original sans `type: 'eip2930'`
export type TransactionSerializableEIP2930<
  TQuantity = bigint,
  TIndex = number,
> = TransactionSerializableBase<TQuantity, TIndex> &
  FeeValues<TQuantity> & {
    accessList?: AccessList
    chainId: TIndex
    yParity?: TIndex
  }

export type TransactionSerializableSuave<
  TQuantity = bigint,
  TIndex = number,
  TType = SuaveTxType,
> = TransactionSerializableEIP2930<TQuantity, TIndex> & {
  executionNode?: Address
  confidentialInputs?: Hex
  confidentialInputsHash?: Hash
  signedComputeRecord?: Hex
  type: TType
}

// Define a type for serialized Suave transactions
export type TransactionSerializedSuave = `${SuaveTxType}${string}`
