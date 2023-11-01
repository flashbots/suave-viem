import { http, Hex, createPublicClient } from 'viem'
import { mainnet, polygon, suaveRigil } from 'viem/chains'
import { SuaveTxTypes, TransactionRequestSuave } from 'viem/chains/suave/types'
import { getSuaveWallet } from 'viem/chains/suave/wallet'

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

const adminWallet = getSuaveWallet(
  {
    chain: suaveRigil,
    transport: http(suaveRigil.rpcUrls.local.http[0]),
  },
  process.env.PRIVATE_KEY! as Hex,
)

const wallet = getSuaveWallet(
  {
    chain: suaveRigil,
    transport: http(suaveRigil.rpcUrls.local.http[0]),
  },
  '0x01000070530220062104600650003002001814120800043ff33603df10300012',
)

console.log('admin', adminWallet.account.address)
console.log('wallet', wallet.account.address)

const fundTx: TransactionRequestSuave = {
  type: '0x0',
  value: 500000000000000000n, // 0.5 ETH
  gasPrice: 100000000n,
  from: adminWallet.account.address,
  chainId: suaveRigil.id,
  to: wallet.account.address,
  gas: 21000n,
}

const ccrReq: TransactionRequestSuave = {
  executionNode: '0xb5feafbdd752ad52afb7e1bd2e40432a485bbb7f',
  confidentialInputs:
    '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000fd7b22626c6f636b4e756d626572223a22307830222c22747873223a5b2230786638363538303064383235323038393461646263653931303332643333396338336463653834316336346566643261393232383165653664383230336538383038343032303131386164613038376337386234353663653762343234386237313565353164326465656236343031363032343832333735663130663037396663666637373934383830653731613035373366336364343133396437323037643165316235623263323365353438623061316361336533373034343739656334653939316362356130623661323930225d2c2270657263656e74223a31307d000000',
  to: '0x8f21Fdd6B4f4CacD33151777A46c122797c8BF17',
  from: wallet.account.address,
  gasPrice: 10000000000n,
  gas: 420000n,
  type: SuaveTxTypes.ConfidentialRequest,
  chainId: suaveRigil.id,
  data: '0x236eb5a70000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000010000000000000000000000008f21fdd6b4f4cacd33151777a46c122797c8bf170000000000000000000000000000000000000000000000000000000000000000',
  /* TODO: modify default gasPrice and gas
  - not defining them makes eth_estimateGas try & fail
  - it stringifies integer values without hexifying them */
}

if (adminWallet.account.type === 'local') {
  const fund = await adminWallet.sendTransaction(fundTx)
  console.log('sent fund tx', fund)
}

// const test = await wallet.signTransaction(ccrReq)
// console.log('signed tx', test)

const res = await wallet.sendTransaction(ccrReq)
// const res = await wallet.sendRawTransaction({serializedTransaction: ccrSigned})

console.log(`sent tx: ${res}`)
