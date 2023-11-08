import {
  InvalidSerializedTransactionError,
  InvalidSerializedTransactionTypeError,
} from '../../errors/transaction.js'
import type { Hex } from '../../types/misc.js'
// import { isHex } from '../../utils/data/isHex.js'
import { hexToBigInt, hexToNumber } from '../../utils/encoding/fromHex.js'
import {
  // type ParseTransactionReturnType,
  toTransactionArray,
} from '../../utils/transaction/parseTransaction.js'
// import { assertTransactionSuave } from './serializers.js'
import type {
  SuaveTxType,
  TransactionSerializableSuave,
  // TransactionSerializedSuave,
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
  if (serializedType !== '0x43') {
    throw new InvalidSerializedTransactionTypeError({
      serializedType: serializedType as Hex,
    })
  }
  const txArray = toTransactionArray(signedComputeRequest)
  /*
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
*/
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

// export type ParseTransactionSuaveReturnType<
//   TSerialized extends TransactionSerializedSuave = TransactionSerializedSuave,
//   TType extends SuaveTxType = '0x42',
// > = ParseTransactionReturnType<TSerialized, TType>

// export function parseTransactionSuave<
//   TSerialized extends TransactionSerializedSuave,
// >(
//   serializedTransaction: TSerialized,
// ): ParseTransactionSuaveReturnType<TSerialized> {
//   return parseSuaveTransaction(
//     serializedTransaction,
//   ) as ParseTransactionSuaveReturnType<TSerialized>
// }

// function parseSuaveTransaction(
//   serializedTransaction: TransactionSerializedSuave,
// ): TransactionSerializableSuave {
//   const transactionArray = toTransactionArray(serializedTransaction)

//   const [
//     type,
//     nonce,
//     to,
//     data,
//     gas,
//     executionNode,
//     confidentialInputsHash,
//     value,
//     gasPrice,
//     chainId,
//     v,
//     r,
//     s,
//   ] = transactionArray

//   if (transactionArray.length !== 12) {
//     throw new InvalidSerializedTransactionError({
//       attributes: {
//         nonce,
//         to,
//         data,
//         gas,
//         executionNode,
//         confidentialInputsHash,
//         value,
//         gasPrice,
//         chainId,
//         v,
//         r,
//         s,
//       },
//       serializedTransaction,
//       type: type as SuaveTxType,
//     })
//   }

//   const transaction: Partial<TransactionSerializableSuave> = {
//     chainId: hexToNumber(chainId as Hex),
//     v: hexToBigInt(v as Hex),
//     r: r as Hex,
//     s: s as Hex,
//     value: hexToBigInt(value as Hex),
//     gas: hexToBigInt(gas as Hex),
//     gasPrice: hexToBigInt(gasPrice as Hex),
//     data: data as Hex,
//     nonce: hexToNumber(nonce as Hex),
//     type: '0x42',
//     executionNode: executionNode as Hex,
//   }

//   if (isHex(to) && to !== '0x') transaction.to = to
//   if (isHex(gas) && gas !== '0x') transaction.gas = hexToBigInt(gas)
//   if (isHex(gasPrice) && gasPrice !== '0x')
//     transaction.gasPrice = hexToBigInt(gasPrice)
//   if (isHex(data) && data !== '0x') transaction.data = data
//   if (isHex(nonce) && nonce !== '0x') transaction.nonce = hexToNumber(nonce)
//   if (isHex(value) && value !== '0x') transaction.value = hexToBigInt(value)
//   if (isHex(executionNode)) transaction.executionNode = executionNode
//   if (isHex(confidentialInputsHash))
//     transaction.confidentialInputsHash = confidentialInputsHash

//   assertTransactionSuave(transaction as TransactionSerializableSuave)

//   return transaction as TransactionSerializableSuave
// }
