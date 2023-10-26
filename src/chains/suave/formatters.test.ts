import { describe, expect, test } from 'vitest'

import { type Hex, zeroAddress } from '~viem/index.js'
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

describe('transaction', () => {
  test('formatter', () => {
    const { transaction } = suaveRigil.formatters!
    const confidentialTx = {
      from: zeroAddress,
      to: zeroAddress,
      gas: '0x13000' as Hex,
      gasPrice: undefined,
      blockHash: zeroAddress,
      blockNumber: '0x55' as Hex,
      hash: zeroAddress,
      nonce: '0x0' as Hex,
      transactionIndex: '0x0' as Hex,
      input: '0x0' as Hex,
      value: '0x0' as Hex,
      typeHex: '0x0' as Hex,
      r: '0x0' as Hex,
      s: '0x0' as Hex,
      v: '0x0' as Hex,
      maxFeePerGas: '0x1' as Hex,
      maxPriorityFeePerGas: '0x1' as Hex,
      accessList: [],
      chainId: '0x1' as Hex,
      type: '0x2' as `0x2`,
    }

    const inputTransaction = {
      executionNode: '0x0' as Hex,
      confidentialComputeRequest: {
        ...confidentialTx,
        executionNode: '0x0' as Hex,
        confidentialInputsHash: '0x0' as Hex,
      },
      confidentialComputeResult: '0x0' as Hex,
      isConfidential: true,
      blockHash: zeroAddress,
      blockNumber: '0x1000000' as Hex,
      gasPrice: '0x424242' as Hex,
      hash: zeroAddress,
      nonce: '0x0' as Hex,
      transactionIndex: '0x0' as Hex,
      r: '0x0' as Hex,
      s: '0x0' as Hex,
      v: '0x0' as Hex,
      from: zeroAddress,
      gas: '0x1000' as Hex,
      input: '0x0' as Hex,
      to: zeroAddress,
      value: '0x0' as Hex,
      typeHex: '0x0' as Hex,
    }

    const formattedTransaction = transaction.format(inputTransaction)
    expect(formattedTransaction).toMatchInlineSnapshot(`
    {
      "blockHash": "0x0000000000000000000000000000000000000000",
      "blockNumber": "0x1000000",
      "chainId": undefined,
      "confidentialComputeRequest": {
        "accessList": [],
        "blockHash": "0x0000000000000000000000000000000000000000",
        "blockNumber": "0x55",
        "chainId": "0x1",
        "confidentialInputsHash": "0x0",
        "executionNode": "0x0",
        "from": "0x0000000000000000000000000000000000000000",
        "gas": "0x13000",
        "gasPrice": undefined,
        "hash": "0x0000000000000000000000000000000000000000",
        "input": "0x0",
        "maxFeePerGas": "0x0",
        "maxPriorityFeePerGas": "0x0",
        "nonce": "0x0",
        "r": "0x0",
        "s": "0x0",
        "to": "0x0000000000000000000000000000000000000000",
        "transactionIndex": "0x0",
        "type": "0x2",
        "typeHex": "0x0",
        "v": "0x0",
        "value": "0x0",
      },
      "confidentialComputeResult": "0x0",
      "executionNode": "0x0",
      "from": "0x0000000000000000000000000000000000000000",
      "gas": "0x1000",
      "gasPrice": undefined,
      "hash": "0x0000000000000000000000000000000000000000",
      "input": "0x0",
      "maxFeePerGas": undefined,
      "maxPriorityFeePerGas": undefined,
      "nonce": "0x0",
      "r": "0x0",
      "s": "0x0",
      "to": "0x0000000000000000000000000000000000000000",
      "transactionIndex": "0x0",
      "type": undefined,
      "typeHex": "0x0",
      "v": "0x0",
      "value": "0x0",
    }
  `)
  })
})

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
  test('formatter (confidential)', () => {
    const { transactionRequest } = suaveRigil.formatters!
    const inputRequest: SuaveTransactionRequest = {
      from: zeroAddress,
      to: zeroAddress,
      gas: 1n,
      // gasPrice: 0n,
      value: 0n,
      executionNode: zeroAddress,
      confidentialInputs: '0x13131313',
      // confidentialResult omitted
      nonce: 13,
      // We accept "data" and "input" for backwards-compatibility reasons.
      // "input" is the newer name and should be preferred by clients.
      // Issue detail: https://github.com/ethereum/go-ethereum/issues/15628
      // Data  *hexutil.Bytes `json:"data"`
      data: '0x0',
      // input: '0x0',
    }
    const formattedRequest = transactionRequest.format(inputRequest)

    expect(formattedRequest).toMatchInlineSnapshot(`
      {
        "confidentialInputs": "0x13131313",
        "data": "0x0",
        "executionNode": "0x0000000000000000000000000000000000000000",
        "from": "0x0000000000000000000000000000000000000000",
        "gas": "0x1",
        "gasPrice": undefined,
        "isConfidential": true,
        "maxFeePerGas": undefined,
        "maxPriorityFeePerGas": undefined,
        "nonce": "0xd",
        "to": "0x0000000000000000000000000000000000000000",
        "type": "0x43",
        "value": "0x0",
      }
    `)
  })

  test('formatter (standard)', () => {
    const { transactionRequest } = suaveRigil.formatters!
    const inputRequest: SuaveTransactionRequest = {
      from: zeroAddress,
      to: zeroAddress,
      gas: 1n,
      // gasPrice: 0n,
      value: 0n,
      executionNode: zeroAddress,
      confidentialInputs: '0x0',
      // confidentialResult omitted
      nonce: 13,
      // We accept "data" and "input" for backwards-compatibility reasons.
      // "input" is the newer name and should be preferred by clients.
      // Issue detail: https://github.com/ethereum/go-ethereum/issues/15628
      // Data  *hexutil.Bytes `json:"data"`
      data: '0x0',
      // input: '0x0',
      type: 'suave',
    }
    const formattedRequest = transactionRequest.format(inputRequest)

    expect(formattedRequest).toMatchInlineSnapshot(`
      {
        "confidentialInputs": "0x0",
        "data": "0x0",
        "executionNode": "0x0000000000000000000000000000000000000000",
        "from": "0x0000000000000000000000000000000000000000",
        "gas": "0x1",
        "gasPrice": undefined,
        "maxFeePerGas": undefined,
        "maxPriorityFeePerGas": undefined,
        "nonce": "0xd",
        "to": "0x0000000000000000000000000000000000000000",
        "type": "0x43",
        "value": "0x0",
      }
    `)
  })
})
