import { sign } from '../../accounts/index.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import {
  http,
  type JsonRpcAccount,
  type PrivateKeyAccount,
  type PublicClient,
  TransactionType,
  type Transport,
  TransportConfig,
  type WalletClient,
  createPublicClient,
  createWalletClient,
  hexToSignature,
  keccak256,
} from '../../index.js'
import type { Hash, Hex } from '../../types/misc.js'
import { suaveRigil } from '../index.js'
import {
  serializeConfidentialComputeRecord,
  serializeConfidentialComputeRequest,
} from './serializers.js'
import {
  PreparedConfidentialRecord,
  SuaveTxRequestTypes,
  SuaveTxType,
  SuaveTxTypes,
  type TransactionRequestSuave,
  TransactionSerializableSuave,
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

/** Sign a CCR with a private key. */
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

/** Returns the appropriate function for signing a CCR, as determined by the given transport.
 *  If the transport is `custom`, `address` must be provided.
 *  If the transport is not `custom`, `privateKey` must be provided instead.
 */
function getSigningFunction<TTransport extends TransportConfig>(
  transport: TTransport,
  privateKey?: Hex,
  address?: Hex,
): (
  txRequest: TransactionSerializableSuave,
) => Promise<ReturnType<typeof formatSignature>> {
  if (transport.type === 'custom') {
    if (!address) {
      throw new Error("'address' is required for custom transports")
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
      throw new Error("'privateKey' is required for non-custom transports")
    }
    return async (txRequest: TransactionSerializableSuave) => {
      const { r, s, v } = await signConfidentialComputeRecord(
        txRequest,
        privateKey,
      )
      if (!r || !s || v === undefined) throw new Error('failed to sign')
      return { r, s, v }
    }
  }
}

/** Get a SUAVE-enabled viem wallet.
 *
 * @param params.transport - the transport to use for RPC requests. Defaults to public testnet.
 * @param params.jsonRpcAccount - the address to use for EIP-1193 requests (browser wallets). Required for `custom` transports.
 * @param params.privateKey - the private key to use for signing transactions. Required for *non*-`custom` transports.
 * @param params.customRpc - the RPC URL to use for SUAVE calls (nonce, gas estimates, etc) when using a `custom` transport. Defaults to transport URL.
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
 *     // ensures reliable RPC requests (nonce, gas estimates, etc) as user switches RPCs in their wallet
 *     customRpc: 'http://localhost:8545',
 *   })
 * }
 * main()
 */
export function getSuaveWallet<TTransport extends Transport>(params: {
  transport?: TTransport
  jsonRpcAccount?: Hex
  privateKey?: Hex
  customRpc?: string
}): SuaveWallet<TTransport> {
  return newSuaveWallet({
    transport: params.transport ?? http(suaveRigil.rpcUrls.public.http[0]),
    privateKey: params.privateKey,
    jsonRpcAccount: params.jsonRpcAccount && {
      address: params.jsonRpcAccount,
      type: 'json-rpc',
    },
    customRpc: params.customRpc,
  })
}

/** Get a SUAVE-enabled viem wallet. */
function newSuaveWallet<TTransport extends Transport>(params: {
  transport: TTransport
  /** must set this for custom transports only. */
  jsonRpcAccount?: JsonRpcAccount
  /** should set this for custom transports. */
  customRpc?: string
  /** must set this for non-custom transports only. */
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
  const account = params.jsonRpcAccount || privateKeyAccount

  return createWalletClient({
    account,
    transport: params.transport,
    chain: suaveRigil,
  }).extend((client) => ({
    /** If `customRpc` is provided, this is used for some RPC requests instead of provided (custom) `transport`.
     *  `transport` is still used for things that require the wallet's account (signing, etc).
     */
    customProvider: getSuaveProvider(
      params.customRpc ? http(params.customRpc) : params.transport,
    ),

    /** Prepare any omitted fields in request. */
    async prepareTxRequest(
      txRequest: TransactionRequestSuave,
    ): Promise<TransactionRequestSuave> {
      const gas =
        txRequest.gas ??
        (() => {
          // TODO: replace this with a working call to eth_estimateGas
          console.warn('no gas provided, using default 30000000')
          return 30000000n
        })()
      const preparedTx = await this.customProvider.prepareTransactionRequest({
        account: client.account,
        ...txRequest,
        gas,
      })
      const gasPrice =
        preparedTx.gasPrice ?? (await this.customProvider.getGasPrice())
      return {
        ...txRequest,
        from: txRequest.from ?? preparedTx.from,
        nonce: txRequest.nonce ?? preparedTx.nonce,
        gas: txRequest.gas ?? preparedTx.gas,
        gasPrice: txRequest.gasPrice ?? gasPrice,
        chainId: txRequest.chainId ?? suaveRigil.id,
      }
    },

    /** Sign a prepared Confidential Compute Record; like a request, but with `confidentialInputsHash` and `type=0x42` */
    async signEIP712ConfidentialRequest(
      request: PreparedConfidentialRecord,
    ): Promise<ReturnType<typeof formatSignature>> {
      if (request.isEIP712 === false)
        throw new Error('cannot sign an EIP712 CCR with isEIP712=false')

      const eip712Tx = {
        ...request,
        nonce: BigInt(request.nonce),
      }
      const rawSig = await client.signTypedData({
        primaryType: 'ConfidentialRecord',
        message: eip712Tx,
        types: {
          Eip712Domain: [
            { name: 'name', type: 'string' },
            { name: 'verifyingContract', type: 'address' },
          ],
          ConfidentialRecord: [
            { name: 'nonce', type: 'uint64' },
            { name: 'gasPrice', type: 'uint256' },
            { name: 'gas', type: 'uint64' },
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'data', type: 'bytes' },
            { name: 'kettleAddress', type: 'address' },
            { name: 'confidentialInputsHash', type: 'bytes32' },
          ],
        },
        domain: {
          name: 'ConfidentialRecord',
          verifyingContract: eip712Tx.kettleAddress,
        },
      })
      return hexToSignature(rawSig)
    },

    /** Sign and Send an unsigned request. */
    async sendTransaction(txRequest: TransactionRequestSuave): Promise<Hash> {
      // signTransaction also invokes prepareTxRequest, but only for CCRs. this is still needed for standard txs.
      const payload = await this.prepareTxRequest(txRequest)
      const signedTx = await this.signTransaction(payload)
      return this.customProvider.request({
        method: 'eth_sendRawTransaction',
        params: [signedTx as Hex],
      })
    },

    /** Sign a transaction request. */
    async signTransaction(
      txRequest: TransactionRequestSuave,
    ): Promise<`${SuaveTxType | TransactionType}${string}`> {
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
        if (txRequest.maxFeePerGas || txRequest.maxPriorityFeePerGas) {
          throw new Error(
            'maxFeePerGas and maxPriorityFeePerGas are not supported for confidential requests',
          )
        }

        const confidentialInputs = txRequest.confidentialInputs ?? '0x'
        // get nonce, gas price, etc.
        const ctxParams = this.prepareTxRequest(txRequest)
        // calling (await ...) inline lets us skip the RPC request if teh data is not needed
        const nonce = txRequest.nonce ?? (await ctxParams).nonce
        const value = txRequest.value ?? 0n
        const gas = txRequest.gas ?? (await ctxParams).gas
        const gasPrice = txRequest.gasPrice ?? (await ctxParams).gasPrice
        const chainId = txRequest.chainId ?? suaveRigil.id
        const isEIP712 = txRequest.isEIP712 ?? true

        // prepare and sign confidential compute request
        if (!txRequest.to) {
          throw new Error('missing `to`')
        }
        if (nonce === undefined) {
          throw new Error('missing `nonce`')
        }
        if (gas === undefined) {
          throw new Error('missing `gas`')
        }
        if (gasPrice === undefined) {
          throw new Error('missing `gasPrice`')
        }
        if (!txRequest.kettleAddress) {
          throw new Error('missing `kettleAddress`')
        }

        const ccRecord: PreparedConfidentialRecord = {
          ...txRequest,
          nonce,
          type: SuaveTxTypes.ConfidentialRecord,
          chainId,
          to: txRequest.to,
          value,
          gas,
          gasPrice,
          data: txRequest.data ?? '0x',
          kettleAddress: txRequest.kettleAddress,
          confidentialInputsHash: keccak256(confidentialInputs),
          isEIP712,
        }

        const sig = isEIP712
          ? await this.signEIP712ConfidentialRequest(ccRecord)
          : await getSigningFunction(
              client.transport,
              params.privateKey,
              params.jsonRpcAccount?.address,
            )(ccRecord)

        const { r, s, v } = formatSignature(sig)
        return serializeConfidentialComputeRequest({
          ...ccRecord,
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
