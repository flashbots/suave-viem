import type { Address } from 'abitype'
import type { Block, BlockTag } from '../../types/block.js'
import type { Hex } from '../../types/misc.js'
import type {
  Index,
  Quantity,
  RpcBlock,
  RpcTransaction as RpcTransaction_,
  RpcTransactionReceipt,
  RpcTransactionRequest as RpcTransactionRequest_,
} from '../../types/rpc.js'
import type {
  Transaction as Transaction_,
  TransactionBase,
  TransactionReceipt,
  TransactionRequest as TransactionRequest_,
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

export type SuaveRpcTransaction<TPending extends boolean = boolean> =
  | (RpcTransaction_<TPending> & {
      ExecutionNode: Address
      ConfidentialComputeRequest: RpcTransaction_<TPending>
      ConfidentialComputeResult: Hex
      IsConfidential?: boolean // Add this line
    })
  | RpcTransactionSuave<TPending>

export type SuaveRpcTransactionRequest = RpcTransactionRequest_ & {
  ExecutionNode?: Address
  IsConfidential?: boolean
}

export type SuaveTransaction<TPending extends boolean = boolean> = Transaction_<
  bigint,
  number,
  TPending
> & {
  ExecutionNode: Address
  ConfidentialComputeRequest: Transaction_<bigint, number, TPending>
  ConfidentialComputeResult: Hex
}

export type SuaveTransactionReceiptOverrides = {
  ExecutionNode: Address | null
  ConfidentialComputeRequest: Transaction_ | null // TODO : modify to regular transaction
  ConfidentialComputeResult: Hex | null
}

export type SuaveTransactionReceipt = TransactionReceipt &
  SuaveTransactionReceiptOverrides

export type SuaveTransactionRequest = TransactionRequest_ & {
  executionNode?: Address
  isConfidential?: boolean
  confidentialInputs?: Hex
  confidentialResult?: Hex
}

type RpcTransactionSuave<TPending extends boolean = boolean> = TransactionBase<
  Quantity,
  Index,
  TPending
> & {
  ExecutionNode: Address
  ConfidentialComputeRequest: RpcTransaction_<TPending>
  ConfidentialComputeResult: Hex
  IsConfidential?: boolean
}

export type SuaveRpcTransactionReceipt = RpcTransactionReceipt & {
  ExecutionNode: Address
  ConfidentialComputeRequest: RpcTransaction_
  ConfidentialComputeResult: Hex
}

// Define a type for serializable Suave transactions
export type SuaveTransactionSerializable = {
  chainId: bigint
  nonce: bigint
  gas: bigint
  to: Address
  value: bigint
  data: Hex
  ExecutionNode: Address
  ConfidentialComputeRequest: {
    ExecutionNode: Address
    Wrapped: { toHex: () => Hex } // Adjust this type as necessary
    // ... other fields
  }
  ConfidentialComputeResult: Hex
}

// Define a type for serialized Suave transactions
export type TransactionSerializedSuave = string
