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

const suaveTxReq: TransactionRequestSuave = {
  executionNode: '0xb5feafbdd752ad52afb7e1bd2e40432a485bbb7f',
  confidentialInputs:
    '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000f07b22626c6f636b4e756d626572223a22307830222c22747873223a5b2230786638363538303064383235336163393461323839303263663565393839663534663639313662393564353539653636653961356132613738383230336538383038343032303131386165613039633539323461386139393066653036346666623831386666303730656164316430666166316133656335313236363465373032346663653130336534353131613034396337323439666530613238633532666163643863333033633461336536666265333032393161373137623237333162623465303437663566393864356536225d7d00000000000000000000000000000000',
  to: '0x2d09719d6f4fa3aae6b43328eb150a6902491713',
  gasPrice: 10000000000n,
  gas: 420000n,
  type: SuaveTxTypes.ConfidentialRequest,
  chainId: suaveRigil.id,
  data: '0xd8f55db90000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c000b1917d524e56d28488947798efb825000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000010249e143b3b31286da7aac26ad2fcab3a60a0d0000000000000000000000000000000000000000000000000000000000000000',
  /* TODO: modify default gasPrice and gas
  - not defining them makes eth_estimateGas try & fail
  - it stringifies integer values without hexifying them */
}

const wallet = getSuaveWallet(process.env.PRIVATE_KEY! as Hex, {
  chain: suaveRigil,
  transport: http(suaveRigil.rpcUrls.local.http[0]),
})

const test = await wallet.signTransaction(suaveTxReq)
console.log('signed tx', test)
const res = await wallet.sendTransaction(suaveTxReq)
console.log(`sent tx: ${res}`)
