import { type ChainFormatters } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { RpcTransaction } from '../../types/rpc.js'
import { defineBlock } from '../../utils/formatters/block.js'
import {
  defineTransaction,
  formatTransaction,
} from '../../utils/formatters/transaction.js'
import { defineTransactionReceipt } from '../../utils/formatters/transactionReceipt.js'
import { defineTransactionRequest } from '../../utils/formatters/transactionRequest.js'

// Introduce the new types
export type ConfidentialComputeRequest = {
  ExecutionNode: string // Assuming address is a string type
  Wrapped: RpcTransaction // This might need to be adjusted to the actual Ethereum Transaction type
}

export type SuaveTransaction = {
  ExecutionNode: string
  ConfidentialComputeRequest: ConfidentialComputeRequest
  ConfidentialComputeResult: string // Assuming bytes are represented as hexadecimal strings
  // TODO: signature fields
}

import type {
  SuaveBlockOverrides,
  SuaveRpcTransaction,
  SuaveRpcTransactionRequest,
  SuaveTransactionReceipt,
  SuaveTransactionReceiptOverrides,
  SuaveTransactionRequest,
} from './types.js'

export const formattersSuave = {
  block: /*#__PURE__*/ defineBlock({
    exclude: ['difficulty', 'gasLimit', 'mixHash', 'nonce', 'uncles'],
    format(
      args: SuaveBlockOverrides & {
        transactions: Hash[] | SuaveRpcTransaction[]
      },
    ): SuaveBlockOverrides & {
      transactions: Hash[] | SuaveTransaction[]
    } {
      const transactions = args.transactions?.map((transaction) => {
        if (typeof transaction === 'string') return transaction
        return {
          ...formatTransaction(transaction as RpcTransaction),
          ExecutionNode: transaction.ExecutionNode,
          ConfidentialComputeRequest: {
            ExecutionNode: transaction.ExecutionNode,
            Wrapped: transaction as RpcTransaction,
          },
          ConfidentialComputeResult: transaction.ConfidentialComputeResult,
          // TODO : Signature fields
        }
      }) as Hash[] | SuaveTransaction[]
      return {
        transactions,
      }
    },
  }),
  transaction: /*#__PURE__*/ defineTransaction({
    format(args: SuaveRpcTransaction): SuaveTransaction {
      if (args.IsConfidential) {
        return {
          ExecutionNode: args.ExecutionNode,
          ConfidentialComputeRequest: {
            ExecutionNode: args.ExecutionNode,
            Wrapped: args.ConfidentialComputeRequest, // This assumes that args.ConfidentialComputeRequest is of type Transaction
          },
          ConfidentialComputeResult: args.ConfidentialComputeResult,
          // TODO : Signature fields
        } as SuaveTransaction
      } else {
        return args as any // TODO : Handle as regular Ethereum transaction
      }
    },
  }),
  transactionReceipt: /*#__PURE__*/ defineTransactionReceipt({
    format(args: SuaveTransactionReceiptOverrides): SuaveTransactionReceipt {
      const {
        ExecutionNode,
        ConfidentialComputeRequest,
        ConfidentialComputeResult,
        ...baseProps
      } = args

      return {
        ...baseProps,
        ExecutionNode,
        ConfidentialComputeRequest: {
          ...ConfidentialComputeRequest,
        },
        ConfidentialComputeResult,
        // signature fields
      } as SuaveTransactionReceipt
    },
  }),

  transactionRequest: /*#__PURE__*/ defineTransactionRequest({
    format(args: SuaveTransactionRequest): SuaveRpcTransactionRequest {
      if (args.IsConfidential) {
        const { ExecutionNode, IsConfidential } = args
        return {
          ...args, // Include other properties from args
          ExecutionNode: ExecutionNode,
          IsConfidential: IsConfidential,
          // We omit the ConfidentialComputeRequest here
        } as SuaveRpcTransactionRequest
      } else {
        return args as any // TODO : Handle as regular Ethereum transaction
      }
    },
  }),
} as const satisfies ChainFormatters
