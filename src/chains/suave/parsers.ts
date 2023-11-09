import {
  InvalidSerializedTransactionError,
  InvalidSerializedTransactionTypeError,
} from '../../errors/transaction.js'
import type { Hex } from '../../types/misc.js'
import { hexToBigInt, hexToNumber } from '../../utils/encoding/fromHex.js'
import { parseTransaction } from '../../utils/transaction/parseTransaction.js'
import { toTransactionArray } from '../../utils/transaction/parseTransaction.js'
import { assertTransactionSuave } from './serializers.js'
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
      executionNode,
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
        executionNode,
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
    executionNode: executionNode as Hex,
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

export const parseSignedComputeRecord = (signedComputeRecord: Hex) => {
  const serializedType = signedComputeRecord.slice(0, 4)
  if (serializedType !== SuaveTxTypes.ConfidentialRecord) {
    throw new InvalidSerializedTransactionTypeError({
      serializedType: serializedType as Hex,
    })
  }
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
    type: '0x42',
  }

  return ccRecord
}

export type ParseTransactionSuaveReturnType<TType extends SuaveTxType,> =
  TransactionSerializableSuave<bigint, number, TType>

export function parseTransactionSuave(
  serializedTransaction: TransactionSerializedSuave,
): ParseTransactionSuaveReturnType<SuaveTxType> {
  const serializedType = serializedTransaction.slice(0, 4)
  const parsedTx =
    serializedType === SuaveTxTypes.ConfidentialRecord
      ? (parseSignedComputeRecord(
          serializedTransaction,
        ) as ParseTransactionSuaveReturnType<'0x42'>)
      : serializedType === SuaveTxTypes.ConfidentialRequest
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
