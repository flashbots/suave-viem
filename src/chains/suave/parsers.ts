// import { InvalidSerializedTransactionError } from '../../errors/transaction.js'
// import type { Hex } from '../../types/misc.js'
// import { isHex } from '../../utils/data/isHex.js'
// import { sliceHex } from '../../utils/data/slice.js'
// import { hexToBigInt, hexToNumber } from '../../utils/encoding/fromHex.js'
// import type { RecursiveArray } from '../../utils/encoding/toRlp.js'
// import type { GetSerializedTransactionType } from '../../utils/transaction/getSerializedTransactionType.js'
// import {
//   type ParseTransactionReturnType,
//   parseAccessList,
//   parseTransaction,
//   toTransactionArray,
// } from '../../utils/transaction/parseTransaction.js'
// import { assertTransactionSuave } from './serializers.js'
// import type {
//   SuaveTransactionSerialized,
//   SuaveTransactionType,
//   TransactionSerializableSuave,
// } from './types.js'

// export type ParseTransactionSuaveReturnType<
//   TSerialized extends SuaveTransactionSerialized = SuaveTransactionSerialized,
//   TType extends SuaveTransactionType = GetSerializedTransactionType<TSerialized>,
// > = ParseTransactionReturnType<TSerialized, TType>

// export function parseTransactionSuave<
//   TSerialized extends SuaveTransactionSerialized,
// >(
//   serializedTransaction: TSerialized,
// ): ParseTransactionSuaveReturnType<TSerialized> {
//   return parseTransaction(
//     serializedTransaction,
//   ) as ParseTransactionSuaveReturnType<TSerialized>
// }

// function parseSuaveTransaction(
//   serializedTransaction: SuaveTransactionSerialized,
// ): TransactionSerializableSuave {
//   const transactionArray = toTransactionArray(serializedTransaction)

//   const [
//     chainId,
//     nonce,
//     gas,
//     to,
//     value,
//     data,
//     ExecutionNode,
//     ConfidentialComputeRequest,
//     ConfidentialComputeResult,
//     v,
//     r,
//     s,
//   ] = transactionArray

//   if (transactionArray.length !== 12) {
//     throw new InvalidSerializedTransactionError({
//       attributes: {
//         chainId,
//         nonce,
//         gas,
//         to,
//         value,
//         data,
//         ExecutionNode,
//         ConfidentialComputeRequest,
//         ConfidentialComputeResult,
//         v,
//         r,
//         s,
//       },
//       serializedTransaction,
//       type: 'suave',
//     })
//   }

//   const transaction: Partial<TransactionSerializableSuave> = {
//     chainId: hexToNumber(chainId as Hex),
//   }

//   if (isHex(to) && to !== '0x') transaction.to = to
//   if (isHex(gas) && gas !== '0x') transaction.gas = hexToBigInt(gas)
//   if (isHex(data) && data !== '0x') transaction.data = data
//   if (isHex(nonce) && nonce !== '0x') transaction.nonce = hexToNumber(nonce)
//   if (isHex(value) && value !== '0x') transaction.value = hexToBigInt(value)
//   if (isHex(ExecutionNode)) transaction.ExecutionNode = ExecutionNode
//   if (isHex(ConfidentialComputeRequest))
//     transaction.ConfidentialComputeRequest = ConfidentialComputeRequest
//   if (isHex(ConfidentialComputeResult))
//     transaction.ConfidentialComputeResult = ConfidentialComputeResult

//   assertTransactionSuave(transaction as TransactionSerializableSuave)

//   return transaction as TransactionSerializableSuave
// }
