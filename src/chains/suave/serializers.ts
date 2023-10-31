// // Import necessary utilities and types
// import { InvalidAddressError } from '../../errors/address.js'
// import { InvalidChainIdError } from '../../errors/chain.js'
// import type { ChainSerializers } from '../../types/chain.js'
// import type { Signature } from '../../types/misc.js'
// import { isAddress } from '../../utils/address/isAddress.js'
// import { toHex } from '../../utils/encoding/toHex.js'
// import { toRlp } from '../../utils/encoding/toRlp.js'
// import type {
//   SuaveTransactionSerializable,
//   TransactionSerializedSuave,
// } from './types.js' // Adjust the import path

import {
  InvalidSerializedTransactionError,
  hexToBigInt,
  hexToNumber,
  isAddress,
  isHex,
} from '~viem/index.js'
import { toTransactionArray } from '~viem/utils/transaction/parseTransaction.js'
import type { Hex, Signature } from '../../types/misc.js'
import { concatHex } from '../../utils/data/concat.js'
import { toHex } from '../../utils/encoding/toHex.js'
import { toRlp } from '../../utils/encoding/toRlp.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import {
  type SuaveTxType,
  SuaveTxTypes,
  type TransactionSerializableSuave,
  type TransactionSerializedSuave,
} from './types.js'

// Define a function to serialize Suave transactions
export const serializeConfidentialRecord = (
  transaction: TransactionSerializableSuave,
  signature?: Signature,
): TransactionSerializedSuave => {
  console.log('txType', transaction.type)
  if (transaction.type !== SuaveTxTypes.ConfidentialRecord) {
    throw new Error('Invalid transaction type') // TODO: make this a custom error
  }
  // Extract fields from the transaction
  const {
    // r,
    // s,
    // v,
    chainId,
    nonce,
    gas,
    gasPrice,
    to,
    value,
    data,
    executionNode,
    confidentialInputs,
  } = transaction

  console.log('Serializing ConfidentialComputeRecord', transaction)

  console.log('tx:', transaction, `sig: ${signature}`)

  // serialize tx as ConfidentialComputeRecord

  // Serialize the transaction fields into an array
  const serializedTransaction: Hex[] = [
    /*
    type ConfidentialComputeRequest struct {
      ConfidentialComputeRecord
      ConfidentialInputs []byte
    }
    type ConfidentialComputeRecord struct {
      Nonce    uint64
      GasPrice *big.Int
      Gas      uint64
      To       *common.Address `rlp:"nil"`
      Value    *big.Int
      Data     []byte

      ExecutionNode          common.Address
      ConfidentialInputsHash common.Hash

      ChainID *big.Int
      V, R, S *big.Int
    */
    /*
    case *ConfidentialComputeRequest:
      return prefixedRlpHash(
        ConfidentialComputeRecordTxType, // Note: this is the same as the Record so that hashes match!
        []interface{}{
          txdata.ExecutionNode,
          txdata.ConfidentialInputsHash,
          tx.Nonce(),
          tx.GasPrice(),
          tx.Gas(),
          tx.To(),
          tx.Value(),
          tx.Data(),
        })
    */

    nonce ? toHex(nonce) : '0x',
    gasPrice ? toHex(gasPrice) : '0x',
    gas ? toHex(gas) : '0x',
    to ?? '0x',
    value ? toHex(value) : '0x',
    data ?? '0x', // data

    executionNode,
    confidentialInputs ? keccak256(confidentialInputs) : '0x',

    chainId ? toHex(chainId) : '0x',
    // r ?? '0x',
    // s ?? '0x',
    // v !== undefined ? (v === 27n ? '0x' : '0x1') : '0x',
  ]

  // Append the signature to the serialized transaction if provided
  if (signature) {
    // if (r && signature.r !== r)
    //   throw new Error(`signature mismatch r=${signature.r} vs r=${r}`)
    // if (s && signature.s !== s)
    //   throw new Error(`signature mismatch s=${signature.s} vs s=${s}`)
    // if (v && signature.v !== v)
    //   throw new Error(`signature mismatch v=${signature.v} vs v=${v}`)
    serializedTransaction.push(
      signature.v === 27n ? '0x' : '0x01', // yParity
      toHex(signature.r),
      toHex(signature.s),
    )
  }

  console.log('serializedRecord', serializedTransaction)

  // Concatenate the serialized transaction array into a single string using RLP encoding
  return concatHex([
    SuaveTxTypes.ConfidentialRecord,
    toRlp(serializedTransaction),
  ]) as TransactionSerializedSuave
}

export const serializeTransactionSuave = (
  transaction: TransactionSerializableSuave,
  signedComputeRecord: Hex,
  _signature?: Signature,
) => {
  if (transaction.type !== SuaveTxTypes.ConfidentialRequest) {
    throw new Error('Invalid transaction type') // TODO: make this a custom error
  }
  const {
    // r,
    // s,
    // v,
    nonce,
    gasPrice,
    gas,
    to,
    value,
    data,
    chainId,
    executionNode,
    confidentialInputs,
    confidentialInputsHash,
  } = transaction

  const transactionArray = toTransactionArray(signedComputeRecord)

  const [
    nonce_,
    gasPrice_,
    gas_,
    to_,
    value_,
    data_,
    executionNode_,
    confidentialInputsHash_,
    chainId_,
    v,
    r,
    s,
  ] = transactionArray

  if (transactionArray.length !== 12) {
    throw new InvalidSerializedTransactionError({
      attributes: {
        nonce,
        to,
        data,
        gas,
        executionNode,
        confidentialInputsHash,
        value,
        gasPrice,
        chainId,
        v,
        r,
        s,
      },
      serializedTransaction: signedComputeRecord,
      type: '0x42' as SuaveTxType,
    })
  }

  console.log('signedComputeRecortd', signedComputeRecord)
  console.log('value_', value_)

  const safeHexToBigInt = (hex: Hex) => {
    if (hex === '0x') return 0n
    return hexToBigInt(hex)
  }

  const safeHexToNumber = (hex: Hex) => {
    if (hex === '0x') return 0
    return hexToNumber(hex)
  }

  console.log('mkay', {
    nonce: safeHexToNumber(nonce_ as Hex),
    to: to_ as Hex,
    data: data_ as Hex,
    gas: hexToBigInt(gas_ as Hex),
    executionNode: executionNode_ as Hex,
    confidentialInputsHash: confidentialInputsHash_ as Hex,
    value: safeHexToBigInt(value_ as Hex),
    gasPrice: safeHexToBigInt(gasPrice_ as Hex),
    chainId: hexToNumber(chainId_ as Hex),
    v: safeHexToBigInt(v as Hex),
    r: r as Hex,
    s: s as Hex,
  })
  const ccRecord: Partial<TransactionSerializableSuave> = {
    nonce: safeHexToNumber(nonce_ as Hex),
    to: to_ as Hex,
    data: data_ as Hex,
    gas: hexToBigInt(gas_ as Hex),
    executionNode: executionNode_ as Hex,
    confidentialInputsHash: confidentialInputsHash_ as Hex,
    value: safeHexToBigInt(value_ as Hex),
    gasPrice: safeHexToBigInt(gasPrice_ as Hex),
    chainId: hexToNumber(chainId_ as Hex),
    v: safeHexToBigInt(v as Hex),
    r: r as Hex,
    s: s as Hex,
  }

  console.log('ccrecord', ccRecord)

  const serializedTransaction: (Hex | Hex[])[] = [
    [
      ccRecord.nonce ? toHex(ccRecord.nonce) : '0x',
      ccRecord.gasPrice ? toHex(ccRecord.gasPrice) : '0x',
      ccRecord.gas ? toHex(ccRecord.gas) : '0x',
      ccRecord.to ?? '0x',
      ccRecord.value ? toHex(ccRecord.value) : '0x',
      ccRecord.data ?? '0x', // data

      executionNode,
      confidentialInputs
        ? keccak256(confidentialInputs)
        : confidentialInputsHash || '0x',

      chainId ? toHex(chainId) : '0x',
      // if (signature) {
      // if (r && signature.r !== r)
      //   throw new Error(`signature mismatch r=${signature.r} vs r=${r}`)
      // if (s && signature.s !== s)
      //   throw new Error(`signature mismatch s=${signature.s} vs s=${s}`)
      // if (v && signature.v !== v)
      //   throw new Error(`signature mismatch v=${signature.v} vs v=${v}`)
      ccRecord.v === 27n ? '0x' : '0x1', // yParity
      toHex(ccRecord.r ?? '0x'),
      toHex(ccRecord.s ?? '0x'),
    ],

    confidentialInputs ?? '0x',
  ]

  // if (signature) {
  //   console.log("HEY LOOK", signature)
  //   serializedTransaction.push(
  //     signature.v === 27n ? '0x0' : '0x1', // yParity
  //     toHex(signature.r),
  //     toHex(signature.s),
  //   )
  // }

  return concatHex([
    SuaveTxTypes.ConfidentialRequest,
    toRlp(serializedTransaction),
  ]) as TransactionSerializedSuave
}

// // Define the Suave serializers object
// export const serializersSuave = {
//   transaction: (tx, sig) => {
//     console.log(`tx: ${tx}`, `sig: ${sig}`)
//     if (tx.type === SuaveTxTypes.ConfidentialRequest) {
//       return serializeTransactionSuave(tx as TransactionSerializableSuave, sig)
//     }
//     return serializeTransaction(tx, sig)
//   },
// } as const satisfies ChainSerializers

export function assertTransactionSuave(
  transaction: TransactionSerializableSuave,
) {
  const {
    chainId,
    gasPrice,
    gas,
    data,
    value,
    maxPriorityFeePerGas,
    maxFeePerGas,
    to,
    r,
    s,
    v,
  } = transaction
  if (chainId && chainId <= 0) throw new Error('invalid chain ID') // TODO: custom err
  if (to && !isAddress(to)) throw new Error('invalid to address') // TODO: custom err
  if (!gasPrice) throw new Error('gasPrice is required')

  if (gas && gas <= 0) throw new Error('invalid gas') // TODO: custom err

  if (data && !isHex(data)) throw new Error('invalid data') // TODO: custom err

  if (value && value < 0) throw new Error('invalid value') // TODO: custom err

  if (maxPriorityFeePerGas && maxPriorityFeePerGas < 0)
    throw new Error('invalid maxPriorityFeePerGas') // TODO: custom err

  if (maxFeePerGas && maxFeePerGas < 0) throw new Error('invalid maxFeePerGas') // TODO: custom err

  if (r && !isHex(r)) throw new Error('invalid r') // TODO: custom err

  if (s && !isHex(s)) throw new Error('invalid s') // TODO: custom err

  if (v && !isHex(v)) throw new Error('invalid v') // TODO: custom err
}
