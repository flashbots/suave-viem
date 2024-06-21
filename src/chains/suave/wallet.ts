import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { sign } from '../../accounts/utils/sign.js'
import {
  http,
  type JsonRpcAccount,
  type PrivateKeyAccount,
  type PublicClient,
  type Transport,
  type TransportConfig,
  type WalletClient,
  createPublicClient,
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

/**
 * Generates an anonymous function that signs a confidential compute request based on the signing method available to the given `transport` type.
 * @param transport The transport to use for signing.
 * @param privateKey The private key to use for signing. *Required for **non-custom** transports.*
 * @param address The address to use for signing. *Required for **custom** transports.*
 * @returns
 */
function getSigningFunction<TTransport extends TransportConfig>(
  transport: TTransport,
  privateKey?: Hex,
  address?: Hex,
) {
  if (transport.type === 'custom') {
    if (!address) {
      throw new Error("param 'address' is required for custom transports")
    }
    return async (txRequest: TransactionSerializableSuave) => {
      const rawSignature: Hex = await transport.request({
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

/** Get a SUAVE-enabled viem wallet.
 *
 * @example
 * import { http } from 'viem'
 * import { getSuaveWallet } from 'viem/chains/utils'
 * const wallet = getSuaveWallet({
 *  transport: http('http://localhost:8545'),
 *  privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
 * })
 *
 * @example
 * // using window.ethereum
 * import { custom } from 'viem'
 * import { getSuaveWallet } from 'viem/chains/utils'
 * async function main() {
 *   const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
 *   const account = accounts[0]
 *   const wallet = getSuaveWallet({
 *     transport: custom(window.ethereum),
 *     jsonRpcAccount: account,
 *   })
 * }
 * main()
 */
export function getSuaveWallet<TTransport extends Transport>(params: {
  transport?: TTransport
  jsonRpcAccount?: Hex
  privateKey?: Hex
}): SuaveWallet<TTransport> {
  return newSuaveWallet({
    transport: params.transport ?? http(suaveRigil.rpcUrls.public.http[0]),
    privateKey: params.privateKey,
    jsonRpcAccount: params.jsonRpcAccount && {
      address: params.jsonRpcAccount,
      type: 'json-rpc',
    },
  })
}

async function prepareTx(client: any, txRequest: TransactionRequestSuave) {
  const preparedTx = await client.prepareTransactionRequest(txRequest)
  const payload: TransactionRequestSuave = {
    ...txRequest,
    from: txRequest.from ?? preparedTx.from,
    nonce: txRequest.nonce ?? preparedTx.nonce,
    gas: txRequest.gas ?? preparedTx.gas,
    gasPrice: txRequest.gasPrice ?? preparedTx.gasPrice,
    chainId: txRequest.chainId ?? suaveRigil.id,
  }
  return payload
}

/** Get a SUAVE-enabled viem wallet. */
function newSuaveWallet<TTransport extends Transport>(params: {
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
  const privateKeyAccount = params.privateKey
    ? privateKeyToAccount(params.privateKey)
    : undefined
  const account = params.jsonRpcAccount ?? privateKeyAccount
  return createWalletClient({
    account,
    transport: params.transport,
    chain: suaveRigil,
  }).extend((client) => ({
    async sendTransaction(txRequest: TransactionRequestSuave) {
      const payload = await prepareTx(client, txRequest)
      const signedTx = await this.signTransaction(payload)
      return client.request({
        method: 'eth_sendRawTransaction',
        params: [signedTx],
      })
    },
    async signTransaction(txRequest: TransactionRequestSuave) {
      if (
        txRequest.type === SuaveTxRequestTypes.ConfidentialRequest ||
        txRequest.kettleAddress ||
        txRequest.confidentialInputs
      ) {
        if (!txRequest.confidentialInputs) {
          throw new Error(
            'confidentialInputs is required for confidential requests',
          )
        }
        if (!txRequest.kettleAddress) {
          throw new Error('kettleAddress is required for confidential requests')
        }

        const confidentialInputs = txRequest.confidentialInputs ?? '0x'
        // determine signing method based on transport type
        const signCcr = getSigningFunction(
          client.transport,
          params.privateKey,
          client.account.address,
        )
        // get nonce, gas price, etc
        const ctxParams = prepareTx(client, txRequest)
        // prepare and sign confidential compute request
        const presignTx = {
          ...txRequest,
          nonce: txRequest.nonce ?? (await ctxParams).nonce,
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
        return await client.account.signTransaction({
          ...txRequest,
          type: txRequest.type ?? txRequest.maxFeePerGas ? '0x2' : '0x0',
        })
      }
    },
  }))
}

/** Creates a new SUAVE Public Client instance.
 * @example
 * import { http } from 'viem'
 * import { getSuaveProvider } from 'viem/chains/utils'
 * const client = getSuaveProvider(http('http://localhost:8545'))
 * @example
 * // using window.ethereum
 * import { custom } from 'viem'
 * import { getSuaveProvider } from 'viem/chains/utils'
 * const client = getSuaveProvider(custom(window.ethereum))
 */
export function getSuaveProvider<TTransport extends Transport>(
  transport?: TTransport,
): SuaveProvider<TTransport> {
  return createPublicClient({
    transport: transport ?? http(suaveRigil.rpcUrls.public.http[0]),
    chain: suaveRigil,
  })
}
