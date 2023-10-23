import { describe, expect, test } from 'vitest'

import { suaveRigil } from '../index.js'
import type { SuaveTransactionRequest } from './types.js'
// Assuming you have similar actions for the Suave chain like the Celo ones provided.
// import { hexToBigInt } from '~viem/index.js'
// import { getBlock } from '../../actions/public/getBlock.js'
// import { getTransaction } from '../../actions/public/getTransaction.js'
// import { getTransactionReceipt } from '../../actions/public/getTransactionReceipt.js'

// describe('block', () => {
//   test('formatter', () => {
//     const { block } = suaveRigil.formatters!

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

describe('transactionRequest', () => {
  test('formatter', () => {
    const { transactionRequest } = suaveRigil.formatters!
    const inputRequest: SuaveTransactionRequest = {
      // From                 *common.Address `json:"from"`
      from: '0x0000000000000000000000000000000000000000',
      // To                   *common.Address `json:"to"`
      to: '0x0000000000000000000000000000000000000000',
      // Gas                  *hexutil.Uint64 `json:"gas"`
      gas: 0n,
      // GasPrice             *hexutil.Big    `json:"gasPrice"`
      gasPrice: 0n,
      // MaxFeePerGas         *hexutil.Big    `json:"maxFeePerGas"`
      // maxFeePerGas: 0n,
      // MaxPriorityFeePerGas *hexutil.Big    `json:"maxPriorityFeePerGas"`
      // maxPriorityFeePerGas: 0n,
      // Value                *hexutil.Big    `json:"value"`
      value: 0n,
      // IsConfidential       bool            `json:"IsConfidential"`
      isConfidential: false,
      // ExecutionNode        *common.Address `json:"executionNode"`
      executionNode: '0x0000000000000000000000000000000000000000',
      // ConfidentialInputs   *hexutil.Bytes  `json:"confidentialInputs"`
      confidentialInputs: '0x0',
      // ConfidentialResult   *hexutil.Bytes  `json:"ConfidentialResult"`
      confidentialResult: '0x0',
      // Nonce                *hexutil.Uint64 `json:"nonce"`
      nonce: 13,

      // // We accept "data" and "input" for backwards-compatibility reasons.
      // // "input" is the newer name and should be preferred by clients.
      // // Issue detail: https://github.com/ethereum/go-ethereum/issues/15628
      // Data  *hexutil.Bytes `json:"data"`
      data: '0x0',
      // Input *hexutil.Bytes `json:"input"`
      // input: '0x0',

      // // Introduced by AccessListTxType transaction.
      // AccessList *types.AccessList `json:"accessList,omitempty"`
      // ChainID    *hexutil.Big      `json:"chainId,omitempty"`
    }
    const formattedRequest = transactionRequest.format(inputRequest)

    expect(formattedRequest).toMatchInlineSnapshot(`
      {
        "confidentialInputs": "0x0",
        "confidentialResult": "0x0",
        "data": "0x0",
        "executionNode": "0x0000000000000000000000000000000000000000",
        "from": "0x0000000000000000000000000000000000000000",
        "gas": 0n,
        "gasPrice": 0n,
        "isConfidential": false,
        "maxFeePerGas": undefined,
        "maxPriorityFeePerGas": undefined,
        "nonce": 13,
        "to": "0x0000000000000000000000000000000000000000",
        "type": undefined,
        "value": 0n,
      }
    `)
  })
})
