import { describe, expect, test } from 'vitest'

import { type Hex, zeroAddress } from '~viem/index.js'
import { suaveRigil } from '../index.js'
import type {
  ConfidentialComputeRecordRpc,
  SuaveRpcTransaction,
  SuaveTransactionRequest,
} from './types.js'

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
  test('formatter (RPC -> Transaction)', () => {
    const { transaction } = suaveRigil.formatters!

    const requestRecord = {
      from: zeroAddress,
      to: '0x1300000000130000000013000000001300000000',
      chainId: '0x1' as Hex,
      gas: '0x13' as Hex,
      gasPrice: '0x1000' as Hex,
      executionNode: zeroAddress,
      confidentialInputsHash: '0x0' as Hex,
      hash: '0x3303d96ec5d3387da51f2fc815ea3e88c5b534383f86eef02a9200f0c6fd5713',
      nonce: '0x0' as Hex,
      input: '0x0' as Hex,
      value: '0x0' as Hex,
      r: '0x0' as Hex,
      s: '0x0' as Hex,
      v: '0x0' as Hex,
      // maxFeePerGas: '0x1' as Hex,
      // maxPriorityFeePerGas: '0x1' as Hex,
      type: '0x42' as `0x42`,
    } as ConfidentialComputeRecordRpc

    const inputTransactionRpc = {
      blockHash:
        '0x8756d7614991fafffd2c788d7213122a2145629860575fb52be80cbef128fbb6',
      executionNode: '0x0' as Hex,
      requestRecord,
      confidentialComputeResult: '0x0' as Hex,
      blockNumber: '0x10' as Hex,
      gasPrice: '0x100' as Hex,
      hash: '0xcd6a47804736bf27ec2a5845c560adcdfab305b4e80452354bcf96fb472fd364',
      nonce: '0x0' as Hex,
      transactionIndex: '0x0' as Hex,
      r: '0x0' as Hex,
      s: '0x0' as Hex,
      v: '0x0' as Hex,
      from: zeroAddress,
      gas: '0x13' as Hex,
      input: '0x0' as Hex,
      to: '0x1300000000130000000013000000001300000000' as Hex,
      value: '0x0' as Hex,
      type: '0x50',
      typeHex: '0x50',
    } as SuaveRpcTransaction

    const formattedTransaction = transaction.format(inputTransactionRpc)
    expect(formattedTransaction).toMatchInlineSnapshot(`
    {
      "blockHash": "0x8756d7614991fafffd2c788d7213122a2145629860575fb52be80cbef128fbb6",
      "blockNumber": 16n,
      "chainId": undefined,
      "confidentialComputeResult": "0x0",
      "executionNode": "0x0",
      "from": "0x0000000000000000000000000000000000000000",
      "gas": 19n,
      "gasPrice": 256n,
      "hash": "0xcd6a47804736bf27ec2a5845c560adcdfab305b4e80452354bcf96fb472fd364",
      "input": "0x0",
      "maxFeePerGas": undefined,
      "maxPriorityFeePerGas": undefined,
      "nonce": 0,
      "r": "0x0",
      "requestRecord": {
        "blockHash": null,
        "blockNumber": null,
        "chainId": 1,
        "confidentialInputsHash": "0x0",
        "executionNode": "0x0000000000000000000000000000000000000000",
        "from": "0x0000000000000000000000000000000000000000",
        "gas": 19n,
        "gasPrice": 4096n,
        "hash": "0x3303d96ec5d3387da51f2fc815ea3e88c5b534383f86eef02a9200f0c6fd5713",
        "input": "0x0",
        "maxFeePerGas": undefined,
        "maxPriorityFeePerGas": undefined,
        "nonce": 0,
        "r": "0x0",
        "s": "0x0",
        "to": "0x1300000000130000000013000000001300000000",
        "transactionIndex": null,
        "type": "confidentialRecord",
        "typeHex": "0x42",
        "v": 0n,
        "value": 0n,
      },
      "s": "0x0",
      "to": "0x1300000000130000000013000000001300000000",
      "transactionIndex": 0,
      "type": "suave",
      "typeHex": "0x0",
      "v": 0n,
      "value": 0n,
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
      gasPrice: 0x10000000n,
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
      type: 'suave',
    }
    const formattedRequest = transactionRequest.format(inputRequest)

    expect(formattedRequest).toMatchInlineSnapshot(`
      {
        "confidentialInputs": "0x13131313",
        "data": "0x0",
        "executionNode": "0x0000000000000000000000000000000000000000",
        "from": "0x0000000000000000000000000000000000000000",
        "gas": "0x1",
        "gasPrice": "0x10000000",
        "isConfidential": true,
        "maxFeePerGas": undefined,
        "maxPriorityFeePerGas": undefined,
        "nonce": "0xd",
        "to": "0x0000000000000000000000000000000000000000",
        "type": "0x50",
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
      gasPrice: 0n,
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
        "gasPrice": "0x0",
        "maxFeePerGas": undefined,
        "maxPriorityFeePerGas": undefined,
        "nonce": "0xd",
        "to": "0x0000000000000000000000000000000000000000",
        "type": "0x50",
        "value": "0x0",
      }
    `)
  })
})
