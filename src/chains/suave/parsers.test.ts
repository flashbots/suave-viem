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
    kettleAddress: accounts[1].address,
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
      "gas": 100n,
      "gasPrice": 100n,
      "kettleAddress": "${sampleTx.kettleAddress}",
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
      "gas": 100n,
      "gasPrice": 100n,
      "kettleAddress": "${sampleTx.kettleAddress}",
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
      '0x43f902aaf90184098412504db4830f4240949a151aa453329f3cdf04d8e4e81585a423f7fc2580b8e4d8f55db90000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c012e8eff6ead85d9d948631a18c41afb60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000009a151aa453329f3cdf04d8e4e81585a423f7fc25000000000000000000000000000000000000000000000000000000000000000094b5feafbdd752ad52afb7e1bd2e40432a485bbb7fa0249c92db3766bc250ffe17682d363e78dbd3aa1fff59a3b5ca242c872910effa8401008c4580a04a0e49a3711af960c5e76d10a21ae318912702b4cfdb37e6baf087edc84feedca02304c28a2a6cb07efa0643e4e2a78bdd2980ccc1d23b359c9cc67543461eb98ab90120000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000dc7b22747873223a5b2230786638363538303064383235336163393431633638353738353161333737633866613736343130396435353933383261393235376334393962383230336538383038343032303131386164613037613861313734613333643136353432363938616538353061303965303530333262373865353934616164613061343164313137376136383333636266633630613031633465663334313031626161363665376338393438376365353062343239653138623733663535323064366130656633396630366234386362343862373064225d7d00000000'
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
