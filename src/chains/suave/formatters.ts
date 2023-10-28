import { type Hex, hexToBigInt } from '~viem/index.js'
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
  ConfidentialComputeRecord,
  RpcTransactionSuave,
  // SuaveBlockOverrides,
  SuaveRpcTransaction,
  SuaveRpcTransactionRequest,
  SuaveTransaction,
  SuaveTransactionReceipt,
  SuaveTransactionReceiptOverrides,
  SuaveTransactionRequest,
} from './types.js'
import { TX_TYPE } from './types.js'

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
      const args_ = args as RpcTransactionSuave
      if (args_.typeHex === TX_TYPE.suave || args_.requestRecord) {
        return {
          // format original eth params as legacy tx
          ...formatTransaction({ ...args_, type: '0x0' }),
          chainId: parseInt(args_.chainId, 16),
          accessList: args.accessList,
          // ... then replace and add fields as needed
          gasPrice: hexToBigInt(args.gasPrice as Hex),
          maxFeePerGas: undefined,
          maxPriorityFeePerGas: undefined,
          executionNode: args_.executionNode,
          requestRecord: {
            // format confidential compute request as legacy tx
            ...formatTransaction({ ...args_.requestRecord, type: '0x0' }),
            // ... then replace and add fields as needed
            chainId:
              args_.requestRecord.chainId &&
              parseInt(args_.requestRecord.chainId, 16),
            type:
              args_.requestRecord.type === TX_TYPE.confidentialRecord
                ? 'confidentialRecord'
                : args_.requestRecord.type,
            gasPrice: hexToBigInt(args_.requestRecord.gasPrice),
            maxFeePerGas: undefined,
            maxPriorityFeePerGas: undefined,
            executionNode: args_.requestRecord.executionNode,
            confidentialInputsHash: args_.requestRecord.confidentialInputsHash,
            typeHex: args_.requestRecord.type,
          } as ConfidentialComputeRecord,
          confidentialComputeResult: args_.confidentialComputeResult,
          type: 'suave',
        } as SuaveTransaction
      } else {
        return formatTransaction({
          ...args,
          type: '0x0',
        } as RpcTransaction) as Transaction
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
          type: args.type && args.type === 'suave' ? TX_TYPE.suave : args.type,
          // We omit the ConfidentialComputeRequest here
        } as SuaveRpcTransactionRequest
      } else {
        return formatTransactionRequest(args as any) as any // TODO : Handle as regular Ethereum transaction
      }
    },
  }),
} as const satisfies ChainFormatters
