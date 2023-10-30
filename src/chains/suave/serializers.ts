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

import type { ChainSerializers } from '../../types/chain.js'
import type { Hex, Signature } from '../../types/misc.js'
import { concatHex } from '../../utils/data/concat.js'
import { toHex } from '../../utils/encoding/toHex.js'
import { toRlp } from '../../utils/encoding/toRlp.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import { serializeTransaction } from '../../utils/transaction/serializeTransaction.js'
import {
  SuaveTxTypes,
  type TransactionSerializableSuave,
  type TransactionSerializedSuave,
} from './types.js'

// Define a function to serialize Suave transactions
export const serializeTransactionSuave = (
  transaction: TransactionSerializableSuave,
  signature?: Signature,
): TransactionSerializedSuave => {
  if (transaction.type === SuaveTxTypes.ConfidentialRequest) {
    // Extract fields from the transaction
    const {
      r,
      s,
      v,
      nonce,
      gas,
      gasPrice,
      to,
      value,
      data,
      executionNode,
      confidentialInputs,
    } = transaction

    console.log('Serializing ConfidentialComputeRequest', transaction)

    // Serialize the transaction fields into an array
    const serializedTransaction: Hex[] = [
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

      executionNode,
      confidentialInputs ? keccak256(confidentialInputs) : '0x',
      nonce ? toHex(nonce) : '0x',
      gasPrice ? toHex(gasPrice) : '0x',
      gas ? toHex(gas) : '0x',
      to ?? '0x',
      value ? toHex(value) : '0x',
      data,

      // chainId ? toHex(chainId) : '0x',
      // r ?? '0x',
      // s ?? '0x',
      // v !== undefined ? (v === 27n ? '0x' : '0x1') : '0x',
    ]
    // ... serialize ConfidentialComputeRequest and ConfidentialComputeResult

    // Append the signature to the serialized transaction if provided
    if (signature) {
      if (r && signature.r !== r)
        throw new Error(`signature mismatch r=${signature.r} vs r=${r}`)
      if (s && signature.s !== s)
        throw new Error(`signature mismatch s=${signature.s} vs s=${s}`)
      if (v && signature.v !== v)
        throw new Error(`signature mismatch v=${signature.v} vs v=${v}`)
      serializedTransaction.push(
        signature.v === 27n ? '0x' : '0x1', // yParity
        toHex(signature.r),
        toHex(signature.s),
      )
    }

    // Concatenate the serialized transaction array into a single string using RLP encoding
    return concatHex([
      SuaveTxTypes.ConfidentialRequest,
      toRlp(serializedTransaction),
    ]) as TransactionSerializedSuave
  } else {
    throw new Error('Invalid transaction type') // TODO: make this a custom error
  }
}

// // Define the Suave serializers object
export const serializersSuave = {
  transaction: (tx, sig) => {
    if (tx.type === SuaveTxTypes.ConfidentialRequest) {
      return serializeTransactionSuave(tx as TransactionSerializableSuave, sig)
    }
    return serializeTransaction(tx, sig)
  },
} as const satisfies ChainSerializers
