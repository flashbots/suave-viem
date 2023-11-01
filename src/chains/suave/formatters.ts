import { zeroAddress } from '../../constants/address.js'
import { type ChainFormatters } from '../../types/chain.js'
import type { Hash, Hex } from '../../types/misc.js'
import type { RpcTransaction } from '../../types/rpc.js'
import type { TransactionRequestBase } from '../../types/transaction.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { toHex } from '../../utils/encoding/toHex.js'
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
import {
  type ConfidentialComputeRecord,
  type RpcTransactionRequestSuave,
  type RpcTransactionSuave,
  type SuaveBlockOverrides,
  type SuaveTransactionReceipt,
  type SuaveTransactionReceiptOverrides,
  type SuaveTxType,
  SuaveTxTypes,
  type TransactionRequestSuave,
  type TransactionSuave,
} from './types.js'

export const formattersSuave = {
  block: /*#__PURE__*/ defineBlock({
    exclude: ['difficulty', 'gasLimit', 'mixHash', 'nonce', 'uncles'],
    format(
      args: SuaveBlockOverrides & {
        transactions:
          | Hash[]
          | (RpcTransactionSuave<SuaveTxType> | RpcTransaction)[]
      },
    ): SuaveBlockOverrides & {
      transactions: Hash[] | TransactionSuave[]
    } {
      const transactions = args.transactions?.map((transaction) => {
        if (typeof transaction === 'string') return transaction
        else if (transaction.type === '0x50') {
          return {
            ...formatTransaction({
              ...transaction,
              type: '0x0',
            } as RpcTransaction),
            gasPrice: hexToBigInt(transaction.gasPrice as Hex),
            executionNode: transaction.executionNode,
            confidentialComputeRequest: {
              executionNode: transaction.executionNode,
              wrapped: transaction as RpcTransaction,
            },
            confidentialComputeResult: transaction.confidentialComputeResult,
            // TODO : Signature fields
          }
        }
        return formatTransaction(transaction as RpcTransaction)
      }) as Hash[] | TransactionSuave[]
      return {
        transactions,
      }
    },
  }),
  transaction: /*#__PURE__*/ defineTransaction({
    format(args: RpcTransactionSuave<SuaveTxTypes.Suave>): TransactionSuave {
      return {
        // format original eth params as legacy tx
        ...formatTransaction({ ...args, type: '0x0' } as RpcTransaction),
        chainId: parseInt(args.chainId, 16),
        accessList: args.accessList,
        // ... then replace and add fields as needed
        gasPrice: hexToBigInt(args.gasPrice as Hex),
        executionNode: args.executionNode,
        requestRecord: {
          // format confidential compute request as legacy tx
          ...{
            ...formatTransaction({
              ...args.requestRecord,
              type: '0x0',
              blockHash: '0x0', // dummy fields to force type coercion
              blockNumber: '0x0',
              transactionIndex: '0x0',
            } as RpcTransaction),
            blockHash: null,
            blockNumber: null,
            transactionIndex: null,
          },
          // ... then replace and add fields as needed
          executionNode: args.requestRecord.executionNode,
          confidentialInputsHash: args.requestRecord.confidentialInputsHash,
          chainId:
            args.requestRecord.chainId &&
            parseInt(args.requestRecord.chainId, 16),
          type: args.requestRecord.type,
          typeHex: args.requestRecord.typeHex,
        } as ConfidentialComputeRecord,
        confidentialComputeResult: args.confidentialComputeResult,
        type: args.type,
        typeHex: args.typeHex,
      } as TransactionSuave
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
    format(args: TransactionRequestSuave): RpcTransactionRequestSuave {
      if (
        args.confidentialInputs &&
        !['0x', '0x0'].includes(args.confidentialInputs)
      ) {
        const { executionNode } = args
        return {
          ...formatTransactionRequest({
            ...args,
            from: zeroAddress,
          } as TransactionRequestBase),
          executionNode,
          isConfidential: true,
          confidentialInputs: args.confidentialInputs,
          type: args.type,
          gasPrice: toHex(args.gasPrice),
          chainId: toHex(args.chainId),
          // We omit the ConfidentialComputeRequest here
        } as RpcTransactionRequestSuave
      } else {
        return formatTransactionRequest(args as any) as any // TODO : Handle as regular Ethereum transaction
      }
    },
  }),
} as const satisfies ChainFormatters
