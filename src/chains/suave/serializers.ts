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
import { numberToHex, toHex } from '../../utils/encoding/toHex.js'
import { toRlp } from '../../utils/encoding/toRlp.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import {
  type SuaveTxType,
  SuaveTxTypes,
  type TransactionSerializableSuave,
  type TransactionSerializedSuave,
} from './types.js'

// Define a function to serialize Suave transactions
export const serializeConfidentialComputeRecord = (
  transaction: TransactionSerializableSuave,
  signature?: Signature,
): TransactionSerializedSuave => {
  console.log('txType', transaction.type)
  if (transaction.type !== SuaveTxTypes.ConfidentialRecord) {
    throw new Error('Invalid transaction type') // TODO: make this a custom error
  }
  if (!transaction.executionNode) {
    throw new Error('execution node is required') // TODO: make this a custom error
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
  // Serialize the transaction fields into an array
  const serializedTransaction: Hex[] = [
    /*
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

    nonce ? numberToHex(nonce) : '0x',
    gasPrice ? numberToHex(gasPrice) : '0x',
    gas ? numberToHex(gas) : '0x',
    to ?? '0x',
    value ? numberToHex(value) : '0x',
    data ?? '0x', // data

    executionNode,
    confidentialInputs ? keccak256(confidentialInputs) : '0x',

    chainId ? numberToHex(chainId) : '0x',
  ]

  // Append the signature to the serialized transaction if provided
  if (signature) {
    serializedTransaction.push(
      signature.v === 27n ? '0x' : '0x01', // yParity
      signature.r,
      signature.s,
    )
  }

  // Concatenate the serialized transaction array into a single string using RLP encoding
  return concatHex([
    SuaveTxTypes.ConfidentialRecord,
    toRlp(serializedTransaction),
  ]) as TransactionSerializedSuave
}

const safeHexToBigInt = (hex: Hex) => {
  if (hex === '0x') return 0n
  return hexToBigInt(hex)
}

const safeHexToNumber = (hex: Hex) => {
  if (hex === '0x') return 0
  return hexToNumber(hex)
}

const deserializeSignedComputeRecord = (signedComputeRecord: Hex) => {
  const transactionArray = toTransactionArray(signedComputeRecord)
  const [
    nonce,
    gasPrice,
    gas,
    to,
    value,
    data,
    executionNode,
    confidentialInputsHash,
    chainId,
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

  const ccRecord: Partial<TransactionSerializableSuave> = {
    nonce: safeHexToNumber(nonce as Hex),
    to: to as Hex,
    data: data as Hex,
    gas: hexToBigInt(gas as Hex),
    executionNode: executionNode as Hex,
    confidentialInputsHash: confidentialInputsHash as Hex,
    value: safeHexToBigInt(value as Hex),
    gasPrice: safeHexToBigInt(gasPrice as Hex),
    chainId: hexToNumber(chainId as Hex),
    v: safeHexToBigInt(v as Hex),
    r: r as Hex,
    s: s as Hex,
  }

  return ccRecord
}

/** RLP serialization for ConfidentialComputeRequest. `_signature is ignored`
 * because the signature from ConfidentialComputeRecord is used instead.
 */
export const serializeConfidentialComputeRequest = (
  transaction: TransactionSerializableSuave,
  signedComputeRecord: Hex,
  _signature?: Signature,
) => {
  if (transaction.type !== SuaveTxTypes.ConfidentialRequest) {
    throw new Error('Invalid transaction type') // TODO: make this a custom error
  }
  const ccRecord = deserializeSignedComputeRecord(signedComputeRecord)
  const confidentialInputsHash =
    transaction.confidentialInputsHash ??
    keccak256(transaction.confidentialInputs || '0x')

  /*
  type ConfidentialComputeRequest struct {
    ConfidentialComputeRecord
    ConfidentialInputs []byte
  }
  */
  const serializedTransaction: (Hex | Hex[])[] = [
    [
      ccRecord.nonce ? numberToHex(ccRecord.nonce) : '0x',
      ccRecord.gasPrice ? toHex(ccRecord.gasPrice) : '0x',
      ccRecord.gas ? toHex(ccRecord.gas) : '0x',
      ccRecord.to ?? '0x',
      ccRecord.value ? toHex(ccRecord.value) : '0x',
      ccRecord.data ?? '0x', // data

      ccRecord.executionNode ?? '0x',
      confidentialInputsHash,

      ccRecord.chainId ? numberToHex(ccRecord.chainId) : '0x',
      ccRecord.v === 27n ? '0x' : '0x1', // yParity
      ccRecord.r as Hex,
      ccRecord.s as Hex,
    ],
    transaction.confidentialInputs ?? '0x',
  ]

  return concatHex([
    SuaveTxTypes.ConfidentialRequest,
    toRlp(serializedTransaction),
  ]) as TransactionSerializedSuave
}

// Define the Suave serializers object
// export const serializersSuave = {
//   transaction: (tx: TransactionRequestSuave, sig: Signature) => {
//     console.log(`tx: ${tx}`, `sig: ${sig}`)
//     if (tx.type === SuaveTxTypes.ConfidentialRequest) {
//       return serializeTransactionSuave(tx as TransactionSerializableSuave, , sig)
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
    confidentialInputs,
    confidentialInputsHash,
    to,
    r,
    s,
    v,
  } = transaction
  if (chainId && chainId <= 0) throw new Error('invalid chain ID') // TODO: custom err
  if (to && !isAddress(to)) throw new Error('invalid to address') // TODO: custom err
  if (!gasPrice) throw new Error('gasPrice is required')

  if (confidentialInputs && !isHex(confidentialInputs))
    throw new Error('invalid confidentialInputs') // TODO: custom err

  if (confidentialInputsHash && !isHex(confidentialInputsHash))
    throw new Error('invalid confidentialInputsHash') // TODO: custom err

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
