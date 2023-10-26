import { parseUnits } from '~viem/index.js'
import { type ChainFormatters } from '../../types/chain.js'
import type { RpcTransaction } from '../../types/rpc.js'
import type {
  Transaction,
  TransactionRequestBase,
} from '../../types/transaction.js'
// import { defineBlock } from '../../utils/formatters/block.js'
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
  RpcTransactionSuave,
  // SuaveBlockOverrides,
  SuaveRpcTransaction,
  SuaveRpcTransactionRequest,
  SuaveTransaction,
  SuaveTransactionReceipt,
  SuaveTransactionReceiptOverrides,
  SuaveTransactionRequest,
} from './types.js'

export const formattersSuave = {
  // block: /*#__PURE__*/ defineBlock({
  //   exclude: ['difficulty', 'gasLimit', 'mixHash', 'nonce', 'uncles'],
  //   format(
  //     args: SuaveBlockOverrides & {
  //       transactions: Hash[] | SuaveRpcTransaction[]
  //     },
  //   ): SuaveBlockOverrides & {
  //     transactions: Hash[] | SuaveTransaction[]
  //   } {
  //     const transactions = args.transactions?.map((transaction) => {
  //       if (typeof transaction === 'string') return transaction
  //       return {
  //         ...formatTransaction(transaction as SuaveRpcTransaction),
  //         executionNode: transaction.executionNode,
  //         confidentialComputeRequest: {
  //           executionNode: transaction.executionNode,
  //           wrapped: transaction as RpcTransaction,
  //         },
  //         ConfidentialComputeResult: transaction.confidentialComputeResult,
  //         // TODO : Signature fields
  //       }
  //     }) as Hash[] | SuaveTransaction[]
  //     return {
  //       transactions,
  //     }
  //   },
  // }),
  transaction: /*#__PURE__*/ defineTransaction({
    format(args: SuaveRpcTransaction): SuaveTransaction | Transaction {
      if ((args as RpcTransactionSuave).isConfidential) {
        const args_ = args as RpcTransactionSuave
        return {
          ...formatTransaction(args),
          gasPrice: parseUnits(args.gasPrice, 0),
          maxFeePerGas: undefined,
          maxPriorityFeePerGas: undefined,
          executionNode: args_.executionNode,
          confidentialComputeRequest: {
            ...formatTransaction(args_.confidentialComputeRequest),
            confidentialInputsHash: args_.confidentialComputeRequest.hash, // TODO: is this right?
            executionNode: args_.executionNode,
          },
          confidentialComputeResult: args_.confidentialComputeResult,
          type: 'suave',
          // TODO : Signature fields
        } as SuaveTransaction
      } else {
        return formatTransaction({
          ...args,
          type: '0x0',
        } as RpcTransaction) as Transaction // TODO : Handle as regular Ethereum transaction
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
      if (
        args.confidentialInputs &&
        !['0x', '0x0'].includes(args.confidentialInputs)
      ) {
        const { executionNode } = args
        return {
          ...formatTransactionRequest(args as TransactionRequestBase),
          executionNode,
          isConfidential: true,
          confidentialInputs: args.confidentialInputs,
          type: args.type || '0x43',
          // We omit the ConfidentialComputeRequest here
        } as SuaveRpcTransactionRequest
      } else {
        return formatTransactionRequest(args as any) as any // TODO : Handle as regular Ethereum transaction
      }
    },
  }),
} as const satisfies ChainFormatters
