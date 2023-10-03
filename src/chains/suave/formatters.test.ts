// import { describe, expect, test } from 'vitest'

// // Assuming you have similar actions for the Suave chain like the Celo ones provided.
// import { getBlock } from '../../actions/public/getBlock.js'
// import { getTransaction } from '../../actions/public/getTransaction.js'
// import { getTransactionReceipt } from '../../actions/public/getTransactionReceipt.js'

// import { suaveRigil } from '../index.js'

// describe('block', () => {
//   test('formatter', () => {
//     const { block } = suaveRigil.formatters!

//     const formattedBlock = block.format({
//       randomness: 'sampleRandomValue',
//       transactions: [
//         {
//           ExecutionNode: 'sampleExecutionNode',
//           ConfidentialComputeRequest: 'sampleRequest',
//           ConfidentialComputeResult: 'sampleResult',
//           // ... other RpcTransaction fields if present
//         },
//       ],
//     })

//     expect(formattedBlock).toMatchInlineSnapshot(`
//       {
//         "randomness": "sampleRandomValue",
//         "transactions": [
//           {
//             "ExecutionNode": "sampleExecutionNode",
//             "ConfidentialComputeRequest": "sampleRequest",
//             "ConfidentialComputeResult": "sampleResult",
//             // ... Other expected fields here
//           }
//         ]
//       }
//     `)
//   })
// })

// describe('transaction', () => {
//   test('formatter', () => {
//     const { transaction } = suaveRigil.formatters!

//     const inputTransaction = {
//       ExecutionNode: 'sampleExecutionNode',
//       ConfidentialComputeRequest: 'sampleRequest',
//       ConfidentialComputeResult: 'sampleResult',
//       // ... other fields if present
//     }

//     const formattedTransaction = transaction.format(inputTransaction)

//     expect(formattedTransaction).toMatchInlineSnapshot(`
//       {
//         "ExecutionNode": "sampleExecutionNode",
//         "ConfidentialComputeRequest": "sampleRequest",
//         "ConfidentialComputeResult": "sampleResult",
//         // ... Other expected fields here
//       }
//     `)
//   })
// })

// describe('transactionReceipt', () => {
//   test('formatter', () => {
//     const { transactionReceipt } = suaveRigil.formatters!

//     const inputReceipt = {
//       // ... input fields based on SuaveRpcTransactionReceiptOverrides
//     }

//     const formattedReceipt = transactionReceipt.format(inputReceipt)

//     expect(formattedReceipt).toMatchInlineSnapshot(`
//       {
//         // ... Expected fields here based on the SuaveRpcTransactionReceiptOverrides format
//       }
//     `)
//   })
// })

// describe('transactionRequest', () => {
//   test('formatter', () => {
//     const { transactionRequest } = suaveRigil.formatters!

//     const inputRequest = {
//       ExecutionNode: 'sampleExecutionNode',
//       ConfidentialComputeRequest: 'sampleRequest',
//       // ... other fields if present
//     }

//     const formattedRequest = transactionRequest.format(inputRequest)

//     expect(formattedRequest).toMatchInlineSnapshot(`
//       {
//         "ExecutionNode": "sampleExecutionNode",
//         "ConfidentialComputeRequest": "sampleRequest",
//         // ... Other expected fields here
//       }
//     `)
//   })
// })
