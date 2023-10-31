import { describe, expectTypeOf, test } from 'vitest'
import { accounts } from '~test/src/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { getBlock } from '../../actions/public/getBlock.js'
import { getTransaction } from '../../actions/public/getTransaction.js'
import { getTransactionReceipt } from '../../actions/public/getTransactionReceipt.js'
import { prepareTransactionRequest } from '../../actions/wallet/prepareTransactionRequest.js'
import { signTransaction } from '../../actions/wallet/signTransaction.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { http } from '../../clients/transports/http.js'
import type { Log } from '../../types/log.js'
import type { Hash } from '../../types/misc.js'
import type { RpcBlock, RpcTransactionReceipt } from '../../types/rpc.js'
import type { TransactionRequest } from '../../types/transaction.js'
import type { Assign } from '../../types/utils.js'
import { sendTransaction } from '../../wallet/index.js'
import { zkSync, zkSyncTestnet } from '../index.js'
import { formattersZkSync } from './formatters.js'
import type {
  ZkSyncEip712Meta,
  ZkSyncL2ToL1Log,
  ZkSyncLog,
  ZkSyncRpcTransaction,
  ZkSyncRpcTransactionReceiptOverrides,
  ZkSyncTransactionRequest,
} from './types.js'

describe('block', () => {
  expectTypeOf(formattersZkSync.block.format).parameter(0).toEqualTypeOf<
    Assign<
      Partial<RpcBlock>,
      {
        l1BatchNumber: `0x${string}`
        l1BatchTimestamp: `0x${string}`
      } & {
        transactions: `0x${string}`[] | ZkSyncRpcTransaction[]
      }
    >
  >()
  expectTypeOf<
    ReturnType<typeof formattersZkSync.block.format>['l1BatchNumber']
  >().toEqualTypeOf<`0x${string}`>
  expectTypeOf<
    ReturnType<typeof formattersZkSync.block.format>['l1BatchTimestamp']
  >().toEqualTypeOf<`0x${string}` | null>
})

describe('transactionReceipt', () => {
  expectTypeOf(formattersZkSync.transactionReceipt.format)
    .parameter(0)
    .toEqualTypeOf<
      Assign<
        Partial<RpcTransactionReceipt>,
        ZkSyncRpcTransactionReceiptOverrides
      >
    >()

  expectTypeOf<
    ReturnType<
      typeof formattersZkSync.transactionReceipt.format
    >['l1BatchNumber']
  >().toEqualTypeOf<bigint | null>()
  expectTypeOf<
    ReturnType<
      typeof formattersZkSync.transactionReceipt.format
    >['l1BatchTxIndex']
  >().toEqualTypeOf<bigint | null>()
  expectTypeOf<
    ReturnType<typeof formattersZkSync.transactionReceipt.format>['l2ToL1Logs']
  >().toEqualTypeOf<
    {
      blockNumber: bigint
      blockHash: string
      l1BatchNumber: bigint
      transactionIndex: bigint
      shardId: bigint
      isService: boolean
      sender: string
      key: string
      value: string
      transactionHash: string
      logIndex: bigint
    }[]
  >()

  expectTypeOf<
    ReturnType<typeof formattersZkSync.transactionReceipt.format>['logs']
  >().toEqualTypeOf<
    (Log<
      bigint,
      number,
      boolean,
      undefined,
      undefined,
      undefined,
      undefined
    > & {
      l1BatchNumber: bigint
      transactionLogIndex: number
      logType: `0x${string}` | null
    })[]
  >()

  expectTypeOf<
    ReturnType<
      typeof formattersZkSync.transactionReceipt.format
    >['logs'][0]['l1BatchNumber']
  >().toEqualTypeOf<bigint>()
  expectTypeOf<
    ReturnType<
      typeof formattersZkSync.transactionReceipt.format
    >['logs'][0]['transactionLogIndex']
  >().toEqualTypeOf<number>()
  expectTypeOf<
    ReturnType<
      typeof formattersZkSync.transactionReceipt.format
    >['logs'][0]['logType']
  >().toEqualTypeOf<`0x${string}` | null>()
})

describe('transactionRequest', () => {
  expectTypeOf(formattersZkSync.transactionRequest.format)
    .parameter(0)
    .toEqualTypeOf<
      Assign<Partial<TransactionRequest>, ZkSyncTransactionRequest>
    >()
  expectTypeOf<
    ReturnType<typeof formattersZkSync.transactionRequest.format>['eip712Meta']
  >().toEqualTypeOf<ZkSyncEip712Meta | undefined>()
})

describe('smoke', () => {
  test('block', async () => {
    const client = createPublicClient({
      chain: zkSync,
      transport: http(),
    })
    const block = await getBlock(client, {
      blockNumber: 35533n,
    })

    expectTypeOf(block.transactions).toEqualTypeOf<Hash[]>()
  })

  test('transaction', async () => {
    const client = createPublicClient({
      chain: zkSync,
      transport: http(),
    })

    const transaction = await getTransaction(client, {
      blockNumber: 16280770n,
      index: 0,
    })

    expectTypeOf(transaction.type).toEqualTypeOf<
      'legacy' | 'eip2930' | 'eip1559' | 'eip712' | 'priority'
    >()
  })

  test('transactionReceipt', async () => {
    const client = createPublicClient({
      chain: zkSync,
      transport: http(),
    })

    const transaction = await getTransactionReceipt(client, {
      hash: '0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6',
    })

    expectTypeOf(transaction.l1BatchTxIndex).toEqualTypeOf<bigint | null>()
    expectTypeOf(transaction.l1BatchNumber).toEqualTypeOf<bigint | null>()
    expectTypeOf(transaction.l2ToL1Logs).toEqualTypeOf<ZkSyncL2ToL1Log[]>()
    expectTypeOf(transaction.logs).toEqualTypeOf<ZkSyncLog[]>()
  })

  test('transactionRequest (prepareTransactionRequest)', async () => {
    const client = createWalletClient({
      account: privateKeyToAccount(accounts[0].privateKey),
      chain: zkSyncTestnet,
      transport: http(),
    })

    prepareTransactionRequest(client, {
      to: '0x111C3E89Ce80e62EE88318C2804920D4c96f92bb',
      data: '0xa4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000094869204461766964340000000000000000000000000000000000000000000000',
      gasPerPubdata: 50000n,
      paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
      paymasterInput:
        '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
      type: 'eip712',
    })
  })

  test('transactionRequest (sendTransaction)', async () => {
    const client = createWalletClient({
      account: privateKeyToAccount(accounts[0].privateKey),
      chain: zkSyncTestnet,
      transport: http(),
    })

    sendTransaction(client, {
      to: '0x111C3E89Ce80e62EE88318C2804920D4c96f92bb',
      maxFeePerGas: 0n,
      gasPerPubdata: 50000n,
      paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
      paymasterInput:
        '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
      type: 'eip712',
    })
  })

  test('transactionRequest (signTransaction)', async () => {
    const client = createWalletClient({
      account: privateKeyToAccount(accounts[0].privateKey),
      chain: zkSync,
      transport: http(),
    })

    signTransaction(client, {
      gasPerPubdata: 50000n,
      maxFeePerGas: 250000000n,
      maxPriorityFeePerGas: 0n,
      to: '0x111C3E89Ce80e62EE88318C2804920D4c96f92bb',
      data: '0xa4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000094869204461766964340000000000000000000000000000000000000000000000',
      paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021',
      paymasterInput:
        '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
      customSignature: '0x1',
      type: 'eip712',
    })
  })
})
