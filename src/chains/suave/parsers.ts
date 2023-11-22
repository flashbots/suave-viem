// import { isAddress, isHex } from '~viem/index.js'
import {
  InvalidSerializedTransactionError,
  InvalidSerializedTransactionTypeError,
} from '../../errors/transaction.js'
import type { Hex } from '../../types/misc.js'
import { isAddress } from '../../utils/address/isAddress.js'
import { isHex } from '../../utils/data/isHex.js'
import { hexToBigInt, hexToNumber } from '../../utils/encoding/fromHex.js'
import { parseTransaction } from '../../utils/transaction/parseTransaction.js'
import { toTransactionArray } from '../../utils/transaction/parseTransaction.js'
import {
  type SuaveTxType,
  SuaveTxTypes,
  type TransactionSerializableSuave,
  type TransactionSerializedSuave,
} from './types.js'

const safeHexToBigInt = (hex: Hex) => {
  if (hex === '0x') return 0n
  return hexToBigInt(hex)
}

const safeHexToNumber = (hex: Hex) => {
  if (hex === '0x') return 0
  return hexToNumber(hex)
}

export const parseSignedComputeRequest = (signedComputeRequest: Hex) => {
  const serializedType = signedComputeRequest.slice(0, 4)
  if (serializedType !== SuaveTxTypes.ConfidentialRequest) {
    throw new InvalidSerializedTransactionTypeError({
      serializedType: serializedType as Hex,
    })
  }
  const txArray = toTransactionArray(signedComputeRequest)
  const [
    [
      nonce,
      gasPrice,
      gas,
      to,
      value,
      data,
      kettleAddress,
      confidentialInputsHash,
      chainId,
      v,
      r,
      s,
    ],
    confidentialInputs,
  ] = txArray
  if (txArray.length !== 2 || txArray[0].length !== 12) {
    throw new InvalidSerializedTransactionError({
      attributes: {
        nonce,
        to,
        data,
        gas,
        kettleAddress,
        confidentialInputsHash,
        value,
        gasPrice,
        chainId,
        v,
        r,
        s,
        confidentialInputs,
      },
      type: '0x43' as SuaveTxType,
      serializedTransaction: signedComputeRequest,
    })
  }
  const ccRequest: Partial<TransactionSerializableSuave> = {
    nonce: safeHexToNumber(nonce as Hex),
    to: to as Hex,
    data: data as Hex,
    gas: hexToBigInt(gas as Hex),
    kettleAddress: kettleAddress as Hex,
    confidentialInputs: confidentialInputs as Hex,
    value: safeHexToBigInt(value as Hex),
    gasPrice: safeHexToBigInt(gasPrice as Hex),
    chainId: hexToNumber(chainId as Hex),
    v: safeHexToBigInt(v as Hex),
    r: r as Hex,
    s: s as Hex,
    type: '0x43',
  }
  return ccRequest
}

/** This type represents the return type of `parseTransactionSuave`.
 *
 * TType is used to inform the transaction type, which is only known after
 * parsing. `SuaveTxType` can be used here type when the transaction
 * type isn't yet known.
 */
export type ParseTransactionSuaveReturnType<TType extends SuaveTxType> =
  TransactionSerializableSuave<bigint, number, TType>

/** Parse a serialized transaction into a SUAVE Transaction object. */
export function parseTransactionSuave(
  serializedTransaction: TransactionSerializedSuave,
): ParseTransactionSuaveReturnType<SuaveTxType> {
  const serializedType = serializedTransaction.slice(0, 4)
  const parsedTx =
    serializedType === SuaveTxTypes.ConfidentialRequest
      ? (parseSignedComputeRequest(
          serializedTransaction,
        ) as ParseTransactionSuaveReturnType<'0x43'>)
      : ({
          ...parseTransaction(serializedTransaction),
          type: '0x0',
        } as ParseTransactionSuaveReturnType<'0x0'>)

  assertTransactionSuave(parsedTx)
  return parsedTx
}

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
    kettleAddress,
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

  if (kettleAddress && !isHex(kettleAddress))
    throw new Error('invalid kettleAddress')

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
