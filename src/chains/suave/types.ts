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

export type { SuaveWallet, SuaveProvider } from './wallet.js'

/// CUSTOM OVERRIDES ===========================================================

export enum SuaveTxRequestTypes {
  Legacy = '0x0',
  ConfidentialRequest = '0x43',
}

export enum SuaveTxTypes {
  ConfidentialRecord = '0x42',
  Suave = '0x50',
}

const AllSuaveTypes = {
  ...SuaveTxRequestTypes,
  ...SuaveTxTypes,
}

// syntactical sugar to allow inline string literals
export type SuaveTxType =
  `${(typeof AllSuaveTypes)[keyof typeof AllSuaveTypes]}`
export type SuaveTxRequestType =
  `${(typeof SuaveTxRequestTypes)[keyof typeof SuaveTxRequestTypes]}`

type ConfidentialOverrides = {
  kettleAddress?: Address
}

type ConfidentialComputeRequestOverrides = ConfidentialOverrides & {
  confidentialInputs?: Hex
}

type ConfidentialComputeRecordOverrides = ConfidentialOverrides & {
  confidentialInputsHash?: Hash
}

export type SuaveBlockOverrides = {} // Add any specific block overrides if necessary for Suave

export type SuaveTransactionReceiptOverrides =
  Partial<ConfidentialOverrides> & {
    confidentialComputeRequest: ConfidentialComputeRecord | null
    confidentialComputeResult: Hex | null
  }

/// BASE ETHEREUM TYPE EXTENSIONS ==============================================

type FeeValues<TQuantity> = Omit<FeeValuesLegacy<TQuantity>, 'gasPrice'> & {
  gasPrice?: TQuantity
}

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
    chainId?: TIndex
    type?: TType
  }

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
> = TransactionSuave<TPending, TType, Hex, Hex>

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
> &
  ConfidentialComputeRecordOverrides

export type ConfidentialComputeRecordRpc<TPending extends boolean = false> =
  ConfidentialComputeRecord<TPending, Hex, Hex>

export type TransactionRequestSuave<
  TQuantity = bigint,
  TIndex = number,
  TType extends SuaveTxRequestType = SuaveTxRequestType,
> = TransactionRequestBase<TQuantity, TIndex, TType> &
  ConfidentialComputeRequestOverrides & {
    from?: Address
  }

export type RpcTransactionRequestSuave<TType = SuaveTxType> =
  TransactionRequestSuave<Hex, Hex> & {
    type: TType
  }

export type TransactionReceiptSuave = TransactionReceipt &
  SuaveTransactionReceiptOverrides

export type RpcTransactionReceiptSuave = RpcTransactionReceipt & {}

/// Original 2930 spec sans `type: 'eip2930'`
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
> = TransactionSerializableEIP2930<TQuantity, TIndex> &
  ConfidentialComputeRecordOverrides &
  ConfidentialComputeRequestOverrides & {
    signedComputeRecord?: Hex
    type: TType
  }

/** Required format for a serialized SUAVE transaction.
 *
 * By default, this type can be used to represent any serialized SUAVE transaction.
 *
 * To restrict the type to a specific SUAVE transaction type, use your specific type as
 * the generic TType argument, e.g. `TransactionSerializedSuave<'0x43'>`.
 */
export type TransactionSerializedSuave<
  TType extends SuaveTxType = SuaveTxType,
> = `${TType}${string}`
