import { describe, expect, test } from 'vitest'
import { accounts } from '~test/src/constants.js'
import { http, keccak256 } from '~viem/index.js'
import { suaveRigil } from '../index.js'
import {
  parseSignedComputeRecord,
  parseSignedComputeRequest,
  parseTransactionSuave,
} from './parsers.js'
import { serializeConfidentialComputeRecord } from './serializers.js'
import {
  type SuaveTxType,
  SuaveTxTypes,
  type TransactionRequestSuave,
} from './types.js'
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
    console.log('signed confidentialRequest', signedTransaction)
    expect(parseSignedComputeRequest(signedTransaction)).toMatchInlineSnapshot(`
    {
      "chainId": ${sampleTx.chainId},
      "confidentialInputs": "${sampleTx.confidentialInputs}",
      "data": "${sampleTx.data}",
      "executionNode": "${sampleTx.executionNode}",
      "gas": 100n,
      "gasPrice": 100n,
      "nonce": 0,
      "r": "0x502ec36261e4b88251ef11134fa6304a0e8ae65200efb9a606ee9eef4343346d",
      "s": "0x0e01ac9093d1bbeee267ee6ac81838a7a4d6ebe62ab3b33753311496b083122f",
      "to": "${sampleTx.to}",
      "type": "0x43",
      "v": 0n,
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
    console.log('serializedRecord', serializedRecord)
    expect(parseSignedComputeRecord(serializedRecord)).toMatchInlineSnapshot(`
    {
      "confidentialInputsHash": "${keccak256(sampleTx.confidentialInputs!)}",
      "data": "${sampleTx.data}",
      "executionNode": "${sampleTx.executionNode}",
      "gas": 100n,
      "gasPrice": 100n,
      "nonce": 0,
      "r": "0x502ec36261e4b88251ef11134fa6304a0e8ae65200efb9a606ee9eef4343346d",
      "s": "0x0e01ac9093d1bbeee267ee6ac81838a7a4d6ebe62ab3b33753311496b083122f",
      "to": "${sampleTx.to}",
      "type": "0x42",
      "v": 0n,
      "value": 0n,
    }
    `)
  })

  test('parseTransactionSuave parses all SUAVE tx types', async () => {
    const serializedTx =
      '0x42f8939470997970c51812dc3a010c7d01b50e0d17dc79c8a0d7cb6956c73dec7e8487c45e7b79a1d62306f0abe3999229b25d5ba6c8a9a6b68064649470997970c51812dc3a010c7d01b50e0d17dc79c8801300a0502ec36261e4b88251ef11134fa6304a0e8ae65200efb9a606ee9eef4343346da00e01ac9093d1bbeee267ee6ac81838a7a4d6ebe62ab3b33753311496b083122f'
    const parsedTx = parseTransactionSuave(serializedTx)
    expect(parsedTx.type).toBe(SuaveTxTypes.ConfidentialRecord)

    const serializedTx2 =
      '0x43f89bf8948064649470997970c51812dc3a010c7d01b50e0d17dc79c880139470997970c51812dc3a010c7d01b50e0d17dc79c8a0d7cb6956c73dec7e8487c45e7b79a1d62306f0abe3999229b25d5ba6c8a9a6b63380a0502ec36261e4b88251ef11134fa6304a0e8ae65200efb9a606ee9eef4343346da00e01ac9093d1bbeee267ee6ac81838a7a4d6ebe62ab3b33753311496b083122f8442424242'
    const parsedTx2 = parseTransactionSuave(serializedTx2)
    expect(parsedTx2.type).toBe(SuaveTxTypes.ConfidentialRequest)

    const serializedTx3 = await wallet.signTransaction({
      to: accounts[1].address,
      data: '0x13',
      gas: 100n,
      gasPrice: 100n,
      type: '0x0',
      chainId: 0x33,
    })
    const parsedTx3 = parseTransactionSuave(serializedTx3 as SuaveTxType)
    expect(parsedTx3.type).toBe('0x0')
  })
})

// TODO: Add tests for invalid transactions
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
