import { type ChainFormatters } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { RpcTransaction } from '../../types/rpc.js'
import type { TransactionRequestBase } from '../../types/transaction.js'
import { defineBlock } from '../../utils/formatters/block.js'
import {
  defineTransaction,
  formatTransaction,
} from '../../utils/formatters/transaction.js'
import { defineTransactionReceipt } from '../../utils/formatters/transactionReceipt.js'
import {
  defineTransactionRequest,
  formatTransactionRequest,
} from '../../utils/formatters/transactionRequest.js'
import type {
  SuaveBlockOverrides,
  SuaveRpcTransaction,
  SuaveRpcTransactionRequest,
  SuaveTransaction,
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
          executionNode: transaction.executionNode,
          confidentialComputeRequest: {
            executionNode: transaction.executionNode,
            wrapped: transaction as RpcTransaction,
          },
          ConfidentialComputeResult: transaction.confidentialComputeResult,
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
      if (args.isConfidential) {
        return {
          ...formatTransaction(args),
          executionNode: args.executionNode,
          confidentialComputeRequest: {
            confidentialInputsHash: args.confidentialComputeRequest.hash, // TODO: is this right?
            executionNode: args.executionNode,
          },
          confidentialComputeResult: args.confidentialComputeResult,
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
        executionNode,
        confidentialComputeRequest,
        confidentialComputeResult,
        ...baseProps
      } = args

      return {
        ...baseProps,
        executionNode,
        confidentialComputeRequest: {
          ...confidentialComputeRequest,
        },
        confidentialComputeResult,
        // signature fields
      } as SuaveTransactionReceipt
    },
  }),
  transactionRequest: /*#__PURE__*/ defineTransactionRequest({
    format(args: SuaveTransactionRequest): SuaveRpcTransactionRequest {
      if (args.isConfidential) {
        const { executionNode, isConfidential } = args
        return {
          ...formatTransactionRequest(args as TransactionRequestBase),
          executionNode,
          isConfidential,
          // We omit the ConfidentialComputeRequest here
        } as SuaveRpcTransactionRequest
      } else {
        return formatTransactionRequest(args as any) as any // TODO : Handle as regular Ethereum transaction
      }
    },
  }),
} as const satisfies ChainFormatters
