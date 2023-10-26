import {
  http,
  Hex,
  createPublicClient,
  createWalletClient,
  zeroAddress,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet, polygon, suaveRigil } from 'viem/chains'
import { SuaveTransactionRequest } from 'viem/chains/suave/types'

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

const suaveTxReq: SuaveTransactionRequest = {
  executionNode: zeroAddress,
  confidentialInputs: '0x13',
  from: zeroAddress,
  to: zeroAddress,
  gasPrice: 10000000000n,
  gas: 21000n,
  /* TODO: modify default gasPrice and gas
  - not defining them makes eth_estimateGas try & fail
  - it stringifies integer values without hexifying them */
}

const wallet = createWalletClient({
  account: privateKeyToAccount(process.env.PRIVATE_KEY! as Hex),
  transport: http(suaveRigil.rpcUrls.local.http[0]),
  chain: publicClients.suaveLocal.chain,
})

const res = await wallet.sendTransaction(suaveTxReq)
console.log(`sent tx: ${res}`)

////////////////////////////////////////////////////////////////////
