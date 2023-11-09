import {
  InvalidSerializedTransactionTypeError,
  isAddress,
  isHex,
} from '../../index.js'
import type { Hex, Signature } from '../../types/misc.js'
import { concatHex } from '../../utils/data/concat.js'
import { numberToHex, toHex } from '../../utils/encoding/toHex.js'
import { toRlp } from '../../utils/encoding/toRlp.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import {
  InvalidConfidentialRecordError,
  InvalidConfidentialRequestError,
} from './errors/transaction.js'
import { parseSignedComputeRecord } from './parsers.js'
import {
  SuaveTxTypes,
  type TransactionSerializableSuave,
  type TransactionSerializedSuave,
} from './types.js'

/** Serializes a ConfidentialComputeRecord transaction. Conforms to [ConfidentialComputeRequest Spec](https://github.com/flashbots/suave-specs/blob/main/specs/rigil/suave-chain.md?plain=1#L135-L158).
Satisfies `ChainSerializers.transaction`
*/
export const serializeConfidentialComputeRecord = (
  transaction: TransactionSerializableSuave,
  signature?: Signature,
): TransactionSerializedSuave => {
  console.log('txType', transaction.type)
  if (transaction.type !== SuaveTxTypes.ConfidentialRecord) {
    throw new InvalidSerializedTransactionTypeError({
      serializedType: transaction.type,
    })
  }
  if (!transaction.executionNode) {
    throw new InvalidConfidentialRecordError({ missingField: 'executionNode' })
  }

  // Extract fields from the transaction
  const {
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

/** RLP serialization for ConfidentialComputeRequest.
 * Conforms to [ConfidentialComputeRequest Spec](https://github.com/flashbots/suave-specs/blob/main/specs/rigil/suave-chain.md?plain=1#L164-L180).
 */
export const serializeConfidentialComputeRequest = (
  transaction: TransactionSerializableSuave,
  signedComputeRecord: Hex,
): SuaveTxTypes.ConfidentialRequest => {
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
  const ccRecord = parseSignedComputeRecord(signedComputeRecord)
  const confidentialInputsHash =
    transaction.confidentialInputsHash ??
    keccak256(transaction.confidentialInputs)

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
  ]) as SuaveTxTypes.ConfidentialRequest
}

/* The following does not work. It's left here as a reminder of how it should be written,
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
    executionNode,
    to,
    r,
    s,
    v,
  } = transaction
  if (chainId && chainId <= 0) throw new Error('invalid chain ID')
  if (to && !isAddress(to)) throw new Error('invalid to address')
  if (!gasPrice) throw new Error('gasPrice is required')

  if (confidentialInputs && !isHex(confidentialInputs))
    throw new Error('invalid confidentialInputs')

  if (executionNode && !isHex(executionNode))
    throw new Error('invalid executionNode')

  if (confidentialInputsHash && !isHex(confidentialInputsHash))
    throw new Error('invalid confidentialInputsHash')

  if (gas && gas <= 0) throw new Error('invalid gas')

  if (data && !isHex(data)) throw new Error('invalid data')

  if (value && value < 0) throw new Error('invalid value')

  if (maxPriorityFeePerGas && maxPriorityFeePerGas < 0)
    throw new Error('invalid maxPriorityFeePerGas')

  if (maxFeePerGas && maxFeePerGas < 0) throw new Error('invalid maxFeePerGas')

  if (r && !isHex(r)) throw new Error(`invalid r: ${r}`)

  if (s && !isHex(s)) throw new Error(`invalid s: ${s}`)

  if (v && v <= 0n) throw new Error(`invalid v: ${v}`)
}
