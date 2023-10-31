import { InvalidSerializedTransactionError } from '../../errors/transaction.js'
import type { Hex } from '../../types/misc.js'
import { isHex } from '../../utils/data/isHex.js'
import { hexToBigInt, hexToNumber } from '../../utils/encoding/fromHex.js'
import {
  type ParseTransactionReturnType,
  toTransactionArray,
} from '../../utils/transaction/parseTransaction.js'
import { assertTransactionSuave } from './serializers.js'
import type {
  SuaveTxType,
  TransactionSerializableSuave,
  TransactionSerializedSuave,
} from './types.js'

export type ParseTransactionSuaveReturnType<
  TSerialized extends TransactionSerializedSuave = TransactionSerializedSuave,
  TType extends SuaveTxType = '0x42',
> = ParseTransactionReturnType<TSerialized, TType>

export function parseTransactionSuave<
  TSerialized extends TransactionSerializedSuave,
>(
  serializedTransaction: TSerialized,
): ParseTransactionSuaveReturnType<TSerialized> {
  return parseSuaveTransaction(
    serializedTransaction,
  ) as ParseTransactionSuaveReturnType<TSerialized>
}

function parseSuaveTransaction(
  serializedTransaction: TransactionSerializedSuave,
): TransactionSerializableSuave {
  const transactionArray = toTransactionArray(serializedTransaction)

  const [
    type,
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
  ] = transactionArray

  if (transactionArray.length !== 13) {
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
      serializedTransaction,
      type: type as SuaveTxType,
    })
  }

  const transaction: Partial<TransactionSerializableSuave> = {
    chainId: hexToNumber(chainId as Hex),
    v: hexToBigInt(v as Hex),
    r: r as Hex,
    s: s as Hex,
    value: hexToBigInt(value as Hex),
    gas: hexToBigInt(gas as Hex),
    gasPrice: hexToBigInt(gasPrice as Hex),
    data: data as Hex,
    nonce: hexToNumber(nonce as Hex),
    type: '0x42',
    executionNode: executionNode as Hex,
  }

  if (isHex(to) && to !== '0x') transaction.to = to
  if (isHex(gas) && gas !== '0x') transaction.gas = hexToBigInt(gas)
  if (isHex(gasPrice) && gasPrice !== '0x')
    transaction.gasPrice = hexToBigInt(gasPrice)
  if (isHex(data) && data !== '0x') transaction.data = data
  if (isHex(nonce) && nonce !== '0x') transaction.nonce = hexToNumber(nonce)
  if (isHex(value) && value !== '0x') transaction.value = hexToBigInt(value)
  if (isHex(executionNode)) transaction.executionNode = executionNode
  if (isHex(confidentialInputsHash))
    transaction.confidentialInputsHash = confidentialInputsHash

  assertTransactionSuave(transaction as TransactionSerializableSuave)

  return transaction as TransactionSerializableSuave
}
