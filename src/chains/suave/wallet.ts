import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { sign } from '../../accounts/utils/sign.js'
import {
  type JsonRpcAccount,
  type PrivateKeyAccount,
  type PublicClient,
  type Transport,
  type WalletClient,
  createWalletClient,
  hexToSignature,
  keccak256,
} from '../../index.js'
import { type Hex } from '../../types/misc.js'
import { suaveRigil } from '../index.js'
import {
  serializeConfidentialComputeRecord,
  serializeConfidentialComputeRequest,
} from './serializers.js'
import {
  SuaveTxRequestTypes,
  SuaveTxTypes,
  type TransactionRequestSuave,
  type TransactionSerializableSuave,
} from './types.js'

/// client types
export type SuaveWallet<TTransport extends Transport> = WalletClient<
  TTransport,
  typeof suaveRigil,
  PrivateKeyAccount | JsonRpcAccount
>

export type SuaveProvider<TTransport extends Transport> = PublicClient<
  TTransport,
  typeof suaveRigil
>

/// helper functions
function formatSignature(signature: {
  r: Hex
  s: Hex
  v: bigint
}): { r: Hex; s: Hex; v: bigint } {
  return {
    r: signature.r,
    s: signature.s,
    v: signature.v === 27n ? 0n : 1n,
  }
}

async function signConfidentialComputeRecord(
  transaction: TransactionSerializableSuave,
  privateKey: Hex,
): Promise<TransactionSerializableSuave> {
  if (transaction.type !== SuaveTxTypes.ConfidentialRecord) {
    throw new Error(
      `transaction.type must be ConfidentialRecord (${SuaveTxTypes.ConfidentialRecord})`,
    )
  }
  const serialized = serializeConfidentialComputeRecord(transaction)
  const signature = await sign({ hash: keccak256(serialized), privateKey })
  return {
    ...transaction,
    ...formatSignature(signature),
  }
}

function getSigningMethod(transport: any, privateKey?: Hex, address?: Hex) {
  if (transport.type === 'custom') {
    return async (txRequest: TransactionSerializableSuave) => {
      const rawSignature = await transport.request({
        method: 'eth_sign',
        params: [
          address,
          keccak256(serializeConfidentialComputeRecord(txRequest)),
        ],
      })
      const parsedSignature = hexToSignature(rawSignature)
      return formatSignature(parsedSignature)
    }
  } else {
    if (!privateKey) {
      throw new Error('privateKey is required for non-custom transports')
    }
    return async (txRequest: TransactionSerializableSuave) => {
      return await signConfidentialComputeRecord(txRequest, privateKey)
    }
  }
}

/** Get a SUAVE-enabled viem wallet. */
export function getSuaveWallet<TTransport extends Transport>(params: {
  transport: TTransport
  jsonRpcAccount?: JsonRpcAccount
  privateKey?: Hex
}): SuaveWallet<TTransport> {
  if (!params.jsonRpcAccount && !params.privateKey) {
    throw new Error("Must provide either 'jsonRpcAccount' or 'privateKey'")
  }
  if (params.jsonRpcAccount && params.privateKey) {
    throw new Error("Cannot provide both 'jsonRpcAccount' and 'privateKey'")
  }
  // Overrides viem wallet methods with SUAVE equivalents.
  return createWalletClient({
    account: params.jsonRpcAccount ?? privateKeyToAccount(params.privateKey!),
    transport: params.transport,
    chain: suaveRigil,
  }).extend((client) => ({
    async sendTransaction(txRequest: TransactionRequestSuave) {
      const preparedTx = await client.prepareTransactionRequest(
        txRequest as any,
      )
      const payload: TransactionRequestSuave = {
        ...txRequest,
        from: preparedTx.from,
        nonce: preparedTx.nonce,
        gas: txRequest.gas ?? preparedTx.gas,
        gasPrice: txRequest.gasPrice ?? preparedTx.gasPrice,
        chainId: txRequest.chainId ?? suaveRigil.id,
      }

      const signedTx = await this.signTransaction(payload)
      return client.request({
        method: 'eth_sendRawTransaction',
        params: [signedTx],
      })
    },
    async signTransaction(txRequest: TransactionRequestSuave) {
      if (txRequest.type === SuaveTxRequestTypes.ConfidentialRequest) {
        const confidentialInputs = txRequest.confidentialInputs || '0x'

        // determine signing method based on transport type
        const signCcr = getSigningMethod(
          client.transport,
          params.privateKey,
          client.account.address,
        )
        const presignTx = {
          ...txRequest,
          type: SuaveTxTypes.ConfidentialRecord,
          confidentialInputsHash: keccak256(confidentialInputs),
          chainId: txRequest.chainId ?? suaveRigil.id,
        }
        const sig = await signCcr(presignTx)
        const { r, s, v } = sig
        return serializeConfidentialComputeRequest({
          ...presignTx,
          confidentialInputs,
          type: SuaveTxRequestTypes.ConfidentialRequest,
          r,
          s,
          v,
        })
      } else {
        return await client.account.signTransaction(txRequest as any)
      }
    },
  }))
}
