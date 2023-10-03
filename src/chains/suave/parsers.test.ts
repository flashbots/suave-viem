// import { expect, test } from 'vitest'

// import { accounts } from '~test/src/constants.js'
// import {
//   parseEther,
//   parseTransaction as parseTransaction_,
//   serializeTransaction,
//   toRlp,
// } from '../../index.js'
// import { parseTransactionSuave } from './parsers.js'
// import { serializeTransactionSuave } from './serializers.js'
// import type { TransactionSerializableSuave } from './types.js'

// test('should be able to parse a standard Suave transaction', () => {
//   const signedTransaction = /* Sample Suave signed transaction */;

//   expect(parseTransactionSuave(signedTransaction)).toMatchInlineSnapshot(`
//     {
//       "chainId": /* Some chain ID */,
//       "gas": /* Some gas amount */,
//       "to": /* Some address */,
//       "value": /* Some value */,
//       "ExecutionNode": /* Execution Node value */,
//       "ConfidentialComputeRequest": /* Compute Request value */,
//       "ConfidentialComputeResult": /* Compute Result value */
//     }
//   `)
// })

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

