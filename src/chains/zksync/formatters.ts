import { type ChainFormatters } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import { hexToBigInt, hexToNumber } from '../../utils/encoding/fromHex.js'
import { hexToBytes } from '../../utils/encoding/toBytes.js'
import { toHex } from '../../utils/encoding/toHex.js'
import { defineBlock } from '../../utils/formatters/block.js'
import { formatLog } from '../../utils/formatters/log.js'
import { defineTransaction } from '../../utils/formatters/transaction.js'
import { defineTransactionReceipt } from '../../utils/formatters/transactionReceipt.js'
import { defineTransactionRequest } from '../../utils/formatters/transactionRequest.js'
import type {
  ZkSyncBlockOverrides,
  ZkSyncL2ToL1Log,
  ZkSyncLog,
  ZkSyncRpcBlockOverrides,
  ZkSyncRpcTransaction,
  ZkSyncRpcTransactionReceiptOverrides,
  ZkSyncRpcTransactionRequest,
  ZkSyncTransaction,
  ZkSyncTransactionReceipt,
  ZkSyncTransactionRequest,
} from './types.js'

export const formattersZkSync = {
  block: /*#__PURE__*/ defineBlock({
    format(
      args: ZkSyncRpcBlockOverrides & {
        transactions: Hash[] | ZkSyncRpcTransaction[]
      },
    ): ZkSyncBlockOverrides & {
      transactions: Hash[] | ZkSyncTransaction[]
    } {
      const transactions = args.transactions?.map((transaction) => {
        if (typeof transaction === 'string') return transaction
        const formatted = formattersZkSync.transaction.format(
          transaction as ZkSyncRpcTransaction,
        ) as ZkSyncTransaction
        if (formatted.typeHex === '0x71') formatted.type = 'eip712'
        else if (formatted.typeHex === '0xff') formatted.type = 'priority'
        return formatted
      }) as Hash[] | ZkSyncTransaction[]
      return {
        l1BatchNumber: hexToBigInt(args.l1BatchNumber),
        l1BatchTimestamp: hexToBigInt(args.l1BatchTimestamp),
        transactions,
      }
    },
  }),
  transaction: /*#__PURE__*/ defineTransaction({
    format(args: ZkSyncRpcTransaction): ZkSyncTransaction {
      const transaction = {} as ZkSyncTransaction
      if (args.type === '0x71') transaction.type = 'eip712'
      else if (args.type === '0xff') transaction.type = 'priority'
      return {
        ...transaction,
        l1BatchNumber: args.l1BatchNumber
          ? hexToBigInt(args.l1BatchNumber)
          : null,
        l1BatchTxIndex: args.l1BatchTxIndex
          ? hexToBigInt(args.l1BatchTxIndex)
          : null,
      } as ZkSyncTransaction
    },
  }),
  transactionReceipt: /*#__PURE__*/ defineTransactionReceipt({
    format(
      args: ZkSyncRpcTransactionReceiptOverrides,
    ): ZkSyncTransactionReceipt {
      return {
        l1BatchNumber: args.l1BatchNumber
          ? hexToBigInt(args.l1BatchNumber)
          : null,
        l1BatchTxIndex: args.l1BatchTxIndex
          ? hexToBigInt(args.l1BatchTxIndex)
          : null,
        logs: args.logs.map((log) => {
          return {
            ...formatLog(log),
            l1BatchNumber: log.l1BatchNumber
              ? hexToBigInt(log.l1BatchNumber)
              : null,
            transactionLogIndex: hexToNumber(log.transactionLogIndex),
            logType: log.logType,
          }
        }) as ZkSyncLog[],
        l2ToL1Logs: args.l2ToL1Logs.map((l2ToL1Log) => {
          return {
            blockNumber: hexToBigInt(l2ToL1Log.blockHash),
            blockHash: l2ToL1Log.blockHash,
            l1BatchNumber: hexToBigInt(l2ToL1Log.l1BatchNumber),
            transactionIndex: hexToBigInt(l2ToL1Log.transactionIndex),
            shardId: hexToBigInt(l2ToL1Log.shardId),
            isService: l2ToL1Log.isService,
            sender: l2ToL1Log.sender,
            key: l2ToL1Log.key,
            value: l2ToL1Log.value,
            transactionHash: l2ToL1Log.transactionHash,
            logIndex: hexToBigInt(l2ToL1Log.logIndex),
          }
        }) as ZkSyncL2ToL1Log[],
      } as ZkSyncTransactionReceipt
    },
  }),
  transactionRequest: /*#__PURE__*/ defineTransactionRequest({
    exclude: [
      'customSignature',
      'factoryDeps',
      'gasPerPubdata',
      'paymaster',
      'paymasterInput',
    ],
    format(args: ZkSyncTransactionRequest): ZkSyncRpcTransactionRequest {
      if (
        args.gasPerPubdata ||
        (args.paymaster && args.paymasterInput) ||
        args.factoryDeps ||
        args.customSignature
      )
        return {
          eip712Meta: {
            ...(args.gasPerPubdata
              ? { gasPerPubdata: toHex(args.gasPerPubdata) }
              : {}),
            ...(args.paymaster && args.paymasterInput
              ? {
                  paymasterParams: {
                    paymaster: args.paymaster,
                    paymasterInput: Array.from(hexToBytes(args.paymasterInput)),
                  },
                }
              : {}),
            ...(args.factoryDeps ? { factoryDeps: args.factoryDeps } : {}),
            ...(args.customSignature
              ? { customSignature: args.customSignature }
              : {}),
          },
          type: args.type === 'eip712' ? '0x71' : '0xff',
        } as ZkSyncRpcTransactionRequest
      return {} as ZkSyncRpcTransactionRequest
    },
  }),
} as const satisfies ChainFormatters
