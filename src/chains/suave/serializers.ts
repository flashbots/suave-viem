import { InvalidSerializedTransactionTypeError } from '../../index.js'
import type { Hex } from '../../types/misc.js'
import { concatHex } from '../../utils/data/concat.js'
import { numberToHex, toHex } from '../../utils/encoding/toHex.js'
import { toRlp } from '../../utils/encoding/toRlp.js'
import {
  InvalidConfidentialRecordError,
  InvalidConfidentialRequestError,
} from './errors/transaction.js'
import {
  SuaveTxTypes,
  type TransactionSerializableSuave,
  type TransactionSerializedSuave,
} from './types.js'

const safeHex = (hex: Hex): Hex => {
  if (hex === '0x0' || hex === '0x00') {
    return '0x'
  } else if (hex.length % 2 !== 0) {
    return `0x0${hex.slice(2)}`
  }
  return hex
}

/** Serializes a ConfidentialComputeRecord transaction. Conforms to [ConfidentialComputeRequest Spec](https://github.com/flashbots/suave-specs/blob/main/specs/rigil/suave-chain.md?plain=1#L135-L158).
Satisfies `ChainSerializers.transaction`
*/
export const serializeConfidentialComputeRecord = (
  transaction: TransactionSerializableSuave,
): TransactionSerializedSuave => {
  if (transaction.type !== SuaveTxTypes.ConfidentialRecord) {
    throw new InvalidSerializedTransactionTypeError({
      serializedType: transaction.type,
    })
  }
  if (!transaction.kettleAddress) {
    throw new InvalidConfidentialRecordError({ missingField: 'kettleAddress' })
  }

  // Extract fields from the original request
  const {
    nonce,
    gas,
    gasPrice,
    to,
    value,
    data,
    kettleAddress,
    confidentialInputsHash,
  } = transaction

  if (!confidentialInputsHash) {
    throw new InvalidConfidentialRecordError({
      missingField: 'confidentialInputsHash',
    })
  }
  if (nonce === undefined) {
    throw new InvalidConfidentialRecordError({ missingField: 'nonce' })
  }
  if (gas === undefined) {
    throw new InvalidConfidentialRecordError({ missingField: 'gas' })
  }
  if (gasPrice === undefined) {
    throw new InvalidConfidentialRecordError({ missingField: 'gasPrice' })
  }

  // Serialize the transaction fields into an array
  const preSerializedTransaction: Hex[] = [
    kettleAddress,
    confidentialInputsHash,
    numberToHex(nonce),
    numberToHex(gasPrice),
    numberToHex(gas),
    to ?? '0x',
    value ? numberToHex(value) : '0x',
    data ?? '0x',
  ].map(safeHex)

  // Concatenate the serialized transaction array into a single string using RLP encoding
  return concatHex([
    SuaveTxTypes.ConfidentialRecord,
    toRlp(preSerializedTransaction),
  ]) as TransactionSerializedSuave
}

/** RLP serialization for ConfidentialComputeRequest.
 * Conforms to [ConfidentialComputeRequest Spec](https://github.com/flashbots/suave-specs/blob/main/specs/rigil/suave-chain.md?plain=1#L164-L180).
 */
export const serializeConfidentialComputeRequest = (
  transaction: TransactionSerializableSuave,
): `${SuaveTxTypes.ConfidentialRequest}${string}` => {
  if (transaction.type !== SuaveTxTypes.ConfidentialRequest) {
    throw new InvalidSerializedTransactionTypeError({
      serializedType: transaction.type,
    })
  }
  if (!transaction.confidentialInputs) {
    throw new InvalidConfidentialRequestError({
      missingField: 'confidentialInputs',
    })
  }
  if (!transaction.confidentialInputsHash) {
    throw new InvalidConfidentialRequestError({
      missingField: 'confidentialInputsHash',
    })
  }
  if (!transaction.kettleAddress) {
    throw new InvalidConfidentialRequestError({
      missingField: 'kettleAddress',
    })
  }
  if (transaction.v === undefined) {
    throw new InvalidConfidentialRequestError({
      missingField: 'v',
      found: transaction.v,
    })
  }
  if (transaction.r === undefined) {
    throw new InvalidConfidentialRequestError({
      missingField: 'r',
      found: transaction.r,
    })
  }
  if (transaction.s === undefined) {
    throw new InvalidConfidentialRequestError({
      missingField: 's',
      found: transaction.s,
    })
  }
  if (transaction.nonce === undefined) {
    throw new InvalidConfidentialRequestError({
      missingField: 'nonce',
      found: transaction.nonce,
    })
  }
  if (!transaction.gas) {
    throw new InvalidConfidentialRequestError({
      missingField: 'gas',
      found: transaction.gas,
    })
  }
  if (!transaction.to) {
    throw new InvalidConfidentialRequestError({
      missingField: 'to',
      found: transaction.to,
    })
  }

  /* This is the final serialization step; what's sent to the JSON-RPC node.  */
  const preSerializedTransaction: (Hex | Hex[])[] = [
    [
      numberToHex(transaction.nonce),
      toHex(transaction.gasPrice),
      toHex(transaction.gas),
      transaction.to,
      toHex(transaction.value || 0),
      transaction.data || '0x',

      transaction.kettleAddress,
      transaction.confidentialInputsHash,

      numberToHex(transaction.chainId),
      toHex(transaction.v),
      transaction.r,
      transaction.s,
    ].map(safeHex),
    safeHex(transaction.confidentialInputs),
  ]
  return concatHex([
    SuaveTxTypes.ConfidentialRequest,
    toRlp(preSerializedTransaction),
  ]) as SuaveTxTypes.ConfidentialRequest
}

/* The following does not work. It's left here as a reminder of how it typically should be written,
  in case we change the signature scheme to match the standard implementation.
  - viem has a fixed signature scheme
  - ccRequest txs have to serialize as a ccRecord first, have the account sign it, then re-serialize as a ccRequest
  - as an alternative to configuring the serializers here, we override sendTransaction and signTransaction in the wallet
*/
// Define the Suave serializers object
// export const serializersSuave = {
//   transaction: (tx: TransactionSerializableSuave, sig?: Signature) => {
//     console.log(`tx: ${tx}`, `sig: ${sig}`)
//     if (tx.type === SuaveTxTypes.ConfidentialRequest) {
//       return serializeConfidentialComputeRequest(tx as TransactionSerializableSuave, , sig)
//     }
//     return serializeTransaction(tx, sig)
//   },
// } as const satisfies ChainSerializers
