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
  type SuaveTxType,
  SuaveTxTypes,
  type TransactionRequestSuave,
  type TransactionSerializableSuave,
} from './types.js'

export function getSuaveWallet<
  TTransport extends Transport,
  TChain extends Chain | undefined = undefined,
>(
  privateKey: Hex,
  params: { transport: TTransport; chain: TChain },
): WalletClient<TTransport, TChain, PrivateKeyAccount> {
  return createWalletClient({
    account: privateKeyToAccount(privateKey),
    transport: params.transport,
    chain: params.chain,
  }).extend((client) => ({
    async sendTransaction(txRequest: TransactionRequestSuave) {
      const preparedTx = await client.prepareTransactionRequest<TChain>(
        txRequest as any,
      )

      const recordPayload = {
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
        value: 0x69000n,
        data: txRequest.data,
        confidentialInputs: txRequest.confidentialInputs,
      } as TransactionSerializableSuave
      console.log('recordPayload', recordPayload)
      const signedComputeRecord = (await this.signTransaction(
        recordPayload,
      )) as SuaveTxType

      const fullTx = serializeConfidentialComputeRequest(
        {
          ...txRequest,
          nonce: preparedTx.nonce,
        } as TransactionSerializableSuave,
        signedComputeRecord,
      )
      return client.request({
        method: 'eth_sendRawTransaction',
        params: [fullTx],
      })
    },
    async signTransaction(txRequest: TransactionSerializableSuave) {
      console.log('im in signTransaction rn', txRequest.type)
      if (txRequest.type === SuaveTxTypes.ConfidentialRequest) {
        // sign confidential compute record
        const signedComputeRecord = await client.account.signTransaction(
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
          { ...txRequest } as TransactionSerializableSuave,
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
