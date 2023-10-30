import { http, Hex, createPublicClient, createWalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet, polygon, suaveRigil } from 'viem/chains'
import { serializeTransactionSuave } from 'viem/chains/suave/serializers'
import {
  SuaveTxTypes,
  TransactionRequestSuave,
  TransactionSerializableSuave,
} from 'viem/chains/suave/types'

////////////////////////////////////////////////////////////////////
// Clients

export const publicClients = {
  mainnet: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
  polygon: createPublicClient({
    chain: polygon,
    transport: http(),
  }),
  suaveRigil: createPublicClient({
    chain: suaveRigil,
    transport: http(),
  }),
  suaveLocal: createPublicClient({
    chain: suaveRigil,
    transport: http(suaveRigil.rpcUrls.local.http[0]),
  }),
}

////////////////////////////////////////////////////////////////////
// Blocks

// const blockNumber = await publicClients.mainnet.getBlockNumber()
// const blockNumber = await publicClients.polygon.getBlockNumber()
// console.log('blockNumber', blockNumber)

////////////////////////////////////////////////////////////////////
// Events, Logs & Filters

// const logs = await publicClients.mainnet.getLogs()
// console.log(logs)

// publicClients.mainnet.watchEvent({
//   onError(error) {
//     console.log(error)
//   },
//   onLogs(logs) {
//     console.log(logs)
//   },
// })

publicClients.suaveLocal.watchPendingTransactions({
  async onTransactions(transactions) {
    console.log('pending', transactions)
    for (const hash of transactions) {
      const fullTx = await publicClients.suaveLocal.getTransaction({ hash })
      console.log('fullTx', fullTx)
      const receipt = await publicClients.suaveLocal.getTransactionReceipt({
        hash,
      })
      console.log('receipt', receipt)
    }
  },
})

const wallet = createWalletClient({
  account: privateKeyToAccount(process.env.PRIVATE_KEY! as Hex),
  transport: http(suaveRigil.rpcUrls.local.http[0]),
  chain: publicClients.suaveLocal.chain,
})

const suaveTxReq: TransactionRequestSuave = {
  executionNode: '0xb5feafbdd752ad52afb7e1bd2e40432a485bbb7f',
  confidentialInputs: '0x13131313',
  to: '0x2d09719d6f4fa3aae6b43328eb150a6902491713',
  gasPrice: 10000000000n,
  gas: 420000n,
  type: SuaveTxTypes.ConfidentialRequest,
  chainId: suaveRigil.id,
  data: '0x',
  /* TODO: modify default gasPrice and gas
  - not defining them makes eth_estimateGas try & fail
  - it stringifies integer values without hexifying them */
}

const serializedTx = serializeTransactionSuave(
  suaveTxReq as TransactionSerializableSuave,
)

console.log('serialized tx', serializedTx)
const res = await wallet.sendTransaction(suaveTxReq)
console.log(`sent tx: ${res}`)

////////////////////////////////////////////////////////////////////
