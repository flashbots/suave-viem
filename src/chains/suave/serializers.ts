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

// // Define a type for the serialized Suave transaction
// export type TransactionSerializedSuave = string // Adjust the type definition as necessary

// // Define a function to serialize Suave transactions
// export const serializeTransactionSuave = (
//   transaction: SuaveTransactionSerializable,
//   signature?: Signature,
// ): TransactionSerializedSuave => {
//   // Extract fields from the transaction
//   const {
//     chainId,
//     nonce,
//     gas,
//     to,
//     value,
//     data,
//     ExecutionNode,
//     ConfidentialComputeRequest,
//     ConfidentialComputeResult,
//   } = transaction

//   // Serialize the transaction fields into an array
//   const serializedTransaction = [
//     toHex(chainId),
//     nonce ? toHex(nonce) : '0x',
//     gas ? toHex(gas) : '0x',
//     to ?? '0x',
//     value ? toHex(value) : '0x',
//     data ?? '0x',
//     ExecutionNode ?? '0x',
//     // ... serialize ConfidentialComputeRequest and ConfidentialComputeResult
//   ]

//   // Append the signature to the serialized transaction if provided
//   if (signature) {
//     serializedTransaction.push(
//       signature.v === 27n ? '0x' : toHex(1), // yParity
//       toHex(signature.r),
//       toHex(signature.s),
//     )
//   }

//   // Concatenate the serialized transaction array into a single string using RLP encoding
//   return toRlp(serializedTransaction)
// }

// // Define the Suave serializers object
// export const serializersSuave = {
//   transaction: serializeTransactionSuave,
// } as const satisfies ChainSerializers
