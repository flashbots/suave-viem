import { describe, expect, test } from 'vitest'
import { accounts } from '~test/src/constants.js'
import { http, type Hex } from '~viem/index.js'
import { parseSignedComputeRequest, parseTransactionSuave } from './parsers.js'
import {
  type SuaveTxType,
  SuaveTxRequestTypes,
} from './types.js'
import { getSuaveWallet } from './wallet.js'
import { suaveRigil } from '../index.js'

const getWallet = () => {
  return getSuaveWallet(
    {
      transport: http('https://rpc.rigil.suave.flashbots.net'),
      privateKey: accounts[0].privateKey,
    },
  )
}

describe('Suave Transaction Parsers', () => {
  test('parseTransactionSuave parses a signed CCR', async () => {
    const wallet = getWallet()
    const ccRequest = {
      to: accounts[1].address,
      data: '0x13' as Hex,
      gas: 100n,
      gasPrice: 100n,
      nonce: 0,
      // isEIP712: true,
      type: SuaveTxRequestTypes.ConfidentialRequest,
      kettleAddress: accounts[1].address,
      confidentialInputs: '0x42424242424242424242424242424242' as Hex,
      value: 0n,
    }
    const signedTransaction = await wallet.signTransaction(ccRequest)
    const parsedCcr = parseSignedComputeRequest(signedTransaction)
    const parsedTx = parseTransactionSuave(signedTransaction as SuaveTxType)
    expect(parsedTx).toMatchInlineSnapshot(`
    {
      "chainId": ${suaveRigil.id},
      "confidentialInputs": "${ccRequest.confidentialInputs}",
      "data": "${ccRequest.data}",
      "gas": 100n,
      "gasPrice": 100n,
      "isEIP712": true,
      "kettleAddress": "${ccRequest.kettleAddress}",
      "nonce": 0,
      "r": "0xae3d9c09d56078e22d4b9747c988f71d086bb24ab42dc15ea431b7bd10e67a99",
      "s": "0x6976c6aaaddec226a56ccb0001935397c68d16f58945769fd855121b7e542863",
      "to": "${ccRequest.to}",
      "type": "0x43",
      "v": 0n,
      "value": 0n,
    }
`)
    expect(parsedCcr).toMatchObject(parsedTx)
  })

  test('parseTransactionSuave parses all SUAVE tx types', async () => {
    const wallet = getWallet()
    const serializedTx =
      '0x43f8acf8998064649470997970c51812dc3a010c7d01b50e0d17dc79c880139470997970c51812dc3a010c7d01b50e0d17dc79c8a0a71e488c022df32f3b11c11282cf8c6f6b1d7c1d8b3bc3dc921cb6c2c5c0aae7018401008c4580a0ae3d9c09d56078e22d4b9747c988f71d086bb24ab42dc15ea431b7bd10e67a99a06976c6aaaddec226a56ccb0001935397c68d16f58945769fd855121b7e5428639042424242424242424242424242424242'
    const parsedTx = parseTransactionSuave(serializedTx)
    expect(parsedTx.type).toBe(SuaveTxRequestTypes.ConfidentialRequest)

    const serializedTx2 = await wallet.signTransaction({
      to: accounts[1].address,
      data: '0x13',
      gas: 100n,
      gasPrice: 100n,
      nonce: 0,
      type: '0x0',
      chainId: 0x33,
    })
    const parsedTx2 = parseTransactionSuave(serializedTx2 as SuaveTxType)
    expect(parsedTx2.type).toBe('0x0')
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
