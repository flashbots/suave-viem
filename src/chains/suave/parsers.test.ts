import { describe, expect, test } from 'vitest'
import { accounts } from '~test/src/constants.js'
import { http, keccak256 } from '~viem/index.js'
import { suaveRigil } from '../index.js'
import {
  parseSignedComputeRecord,
  parseSignedComputeRequest,
} from './parsers.js'
import { serializeConfidentialComputeRecord } from './serializers.js'
import { SuaveTxTypes, type TransactionRequestSuave } from './types.js'
import { getSuaveWallet } from './wallet.js'

describe('Suave Transaction Parsers', () => {
  const wallet = getSuaveWallet(
    {
      transport: http(suaveRigil.rpcUrls.local.http[0]),
      chain: suaveRigil,
    },
    accounts[0].privateKey,
  )
  const sampleTx = {
    to: accounts[1].address,
    data: '0x13',
    gas: 100n,
    gasPrice: 100n,
    type: '0x43',
    chainId: 0x33,
    executionNode: accounts[1].address,
    confidentialInputs: '0x42424242',
  } as TransactionRequestSuave

  test('parses a signed ConfidentialComputeRequest', async () => {
    const signedTransaction = await wallet.signTransaction(sampleTx)
    expect(parseSignedComputeRequest(signedTransaction)).toMatchInlineSnapshot(`
    {
      "chainId": ${sampleTx.chainId},
      "confidentialInputs": "${sampleTx.confidentialInputs}",
      "data": "${sampleTx.data}",
      "executionNode": "${sampleTx.executionNode}",
      "gas": 100n,
      "gasPrice": 100n,
      "nonce": 0,
      "r": "0xe5e7720a3006927f6fc388cfaf5fd258a6664975ff387fac2b37197b7d305a81",
      "s": "0x7f89b8a98f04e02e4e810c7b575c6736ad36c9ee1fe98c73e0b8f74d1e522968",
      "to": "${sampleTx.to}",
      "type": "0x43",
      "v": 1n,
      "value": 0n,
    }
  `)
  })

  test('parses a signed ConfidentialComputeRecord', async () => {
    const signedTransaction = await wallet.signTransaction(sampleTx)
    const { r, s, v } = parseSignedComputeRequest(signedTransaction)
    const record = {
      ...sampleTx,
      type: SuaveTxTypes.ConfidentialRecord,
    }
    const serializedRecord = serializeConfidentialComputeRecord(record, {
      r: r!,
      s: s!,
      v: v!,
    })
    expect(parseSignedComputeRecord(serializedRecord)).toMatchInlineSnapshot(`
    {
      "chainId": ${sampleTx.chainId},
      "confidentialInputsHash": "${keccak256(sampleTx.confidentialInputs!)}",
      "data": "${sampleTx.data}",
      "executionNode": "${sampleTx.executionNode}",
      "gas": 100n,
      "gasPrice": 100n,
      "nonce": 0,
      "r": "0xe5e7720a3006927f6fc388cfaf5fd258a6664975ff387fac2b37197b7d305a81",
      "s": "0x7f89b8a98f04e02e4e810c7b575c6736ad36c9ee1fe98c73e0b8f74d1e522968",
      "to": "${sampleTx.to}",
      "type": "0x42",
      "v": 1n,
      "value": 0n,
    }
    `)
  })
})

// test('should parse a Suave transaction with data', () => {
//   const transactionWithData = {
//     ...transaction,
//     data: '0x1234', // Example data for this test
//   }

//   const serialized = serializeTransactionSuave(transactionWithData)

//   expect(parseTransactionSuave(serialized)).toMatchInlineSnapshot(`
//     {
//       ...otherTransactionDetails,
//       "data": "0x1234"
//     }
//   `)
// })

// test('should parse a Suave transaction with Execution Node', () => {
//   const transactionWithNode = {
//     ...transaction,
//     ExecutionNode: accounts[1].address,  // Example address
//   }

//   const serialized = serializeTransactionSuave(transactionWithNode)

//   expect(parseTransactionSuave(serialized)).toMatchInlineSnapshot(`
//     {
//       ...otherTransactionDetails,
//       "ExecutionNode": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8"
//     }
//   `)
// })

// test('invalid transaction (all missing)', () => {
//   expect(() =>
//     parseTransactionSuave(`0xYourPrefix${toRlp([]).slice(2)}`),
//   ).toThrowErrorMatchingInlineSnapshot(`
//     "Invalid serialized transaction of type \\"suave\\" was provided.

//     Serialized Transaction: \\"YourSerializedTransaction\\"
//     Missing Attributes: /* List of missing attributes */

//     Version: viem@YourVersion"
//   `)
// })

// test('invalid transaction (missing ConfidentialComputeRequest)', () => {
//   const transactionMissingCompute = {
//     ...transaction,
//     ConfidentialComputeRequest: undefined,
//   }

//   const serialized = serializeTransactionSuave(transactionMissingCompute)

//   expect(() =>
//     parseTransactionSuave(serialized),
//   ).toThrowErrorMatchingInlineSnapshot(`
//     "Invalid serialized transaction of type \\"suave\\" was provided.

//     Serialized Transaction: \\"YourSerializedTransaction\\"
//     Missing Attributes: ConfidentialComputeRequest

//     Version: viem@YourVersion"
//   `)
// })

// // ... Additional tests specific to your needs ...
