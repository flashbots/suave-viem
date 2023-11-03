import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import {
  type Chain,
  type PrivateKeyAccount,
  type Transport,
  type WalletClient,
  createWalletClient,
  keccak256,
} from '../../index.js'
import { type Hex } from '../../types/misc.js'
import {
  serializeConfidentialComputeRecord,
  serializeConfidentialComputeRequest,
} from './serializers.js'
import {
  SuaveTxTypes,
  type TransactionRequestSuave,
  type TransactionSerializableSuave,
} from './types.js'

export function getSuaveWallet<
  TTransport extends Transport,
  TChain extends Chain,
>(
  params: { transport: TTransport; chain: TChain },
  privateKey: Hex,
): WalletClient<
  TTransport,
  TChain,
  PrivateKeyAccount // TODO: generalize account types (required to make metamask transport work)
> {
  return createWalletClient({
    account: privateKey ? privateKeyToAccount(privateKey) : undefined,
    transport: params.transport,
    chain: params.chain,
  }).extend((client) => ({
    async sendTransaction(txRequest: TransactionRequestSuave) {
      console.log('wallet address', client.account?.address)
      const preparedTx = await client.prepareTransactionRequest(
        txRequest as any,
      )
      const payload = {
        ...txRequest,
        confidentialInputsHash: txRequest.confidentialInputs
          ? keccak256(txRequest.confidentialInputs)
          : '0x',
        executionNode: txRequest.executionNode,
        chainId: txRequest.chainId,
        gas: txRequest.gas,
        gasPrice: txRequest.gasPrice,
        nonce: preparedTx.nonce,
        to: txRequest.to,
        value: txRequest.value,
        data: txRequest.data,
        confidentialInputs: txRequest.confidentialInputs,
      }

      let fullTx: Hex
      if (txRequest.type === SuaveTxTypes.ConfidentialRequest) {
        const signedComputeRecord = await this.signTransaction({
          ...payload,
          type: SuaveTxTypes.ConfidentialRecord,
        })

        fullTx = serializeConfidentialComputeRequest(
          {
            ...payload,
            nonce: preparedTx.nonce,
            type: SuaveTxTypes.ConfidentialRequest,
          } as TransactionSerializableSuave,
          signedComputeRecord,
        )
      } else {
        fullTx = await this.signTransaction(payload)
      }
      return client.request({
        method: 'eth_sendRawTransaction',
        params: [fullTx],
      })
    },
    async signTransaction(txRequest: TransactionRequestSuave) {
      if (txRequest.type === SuaveTxTypes.ConfidentialRequest) {
        // sign confidential compute record
        const signedComputeRecord = await client.account?.signTransaction(
          {
            ...txRequest,
            type: SuaveTxTypes.ConfidentialRecord,
          } as TransactionSerializableSuave,
          {
            serializer: serializeConfidentialComputeRecord,
          },
        )
        // serialize as confidential compute request
        const fullTx = serializeConfidentialComputeRequest(
          {
            ...txRequest,
            type: SuaveTxTypes.ConfidentialRequest,
          } as TransactionSerializableSuave,
          signedComputeRecord,
        )
        return fullTx
      } else if (txRequest.type === SuaveTxTypes.ConfidentialRecord) {
        const preparedTx = await client.prepareTransactionRequest(
          txRequest as any,
        )
        return await client.account.signTransaction(
          {
            ...txRequest,
            confidentialInputsHash: txRequest.confidentialInputs
              ? keccak256(txRequest.confidentialInputs)
              : '0x',
            type: SuaveTxTypes.ConfidentialRecord,
            chainId: txRequest.chainId,
            gas: txRequest.gas,
            gasPrice: txRequest.gasPrice,
            nonce: preparedTx.nonce,
            to: txRequest.to,
            value: txRequest.value,
            data: txRequest.data,
          } as TransactionSerializableSuave,
          {
            serializer: serializeConfidentialComputeRecord,
          },
        )
      } else {
        return await client.account.signTransaction(txRequest as any)
      }
    },
  }))
}
