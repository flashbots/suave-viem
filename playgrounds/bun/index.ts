import { sleep } from 'bun'
import {
  http,
  Address,
  Hex,
  createPublicClient,
  encodeFunctionData,
} from 'viem'
import { mainnet, polygon, suaveRigil } from 'viem/chains'
import { SuaveTxTypes, TransactionRequestSuave } from 'viem/chains/suave/types'
import { getSuaveWallet } from 'viem/chains/suave/wallet'
import ConfidentialWithLogs from './contracts/out/ConfidentialWithLogs.sol/ConfidentialWithLogs.json'

////////////////////////////////////////////////////////////////////
// Clients

const KETTLE_ADDRESS = '0xb5feafbdd752ad52afb7e1bd2e40432a485bbb7f'

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

// uncomment to watch pending txs as they come in:
// publicClients.suaveLocal.watchPendingTransactions({
//   async onTransactions(transactions) {
//     console.log('pending', transactions)
//     for (const hash of transactions) {
//       const fullTx = await publicClients.suaveLocal.getTransaction({ hash })
//       console.log('(pending) fullTx', fullTx)
//       const timeoutStart = new Date()
//       const timeout = 30 * 1000
//       while (true) {
//         if (new Date().getTime() - timeoutStart.getTime() > timeout) {
//           console.warn('timeout: never found tx receipt', hash)
//           break
//         }
//         await sleep(4000)
//         try {
//           const receipt = await publicClients.suaveLocal.getTransactionReceipt({
//             hash,
//           })
//           console.log('receipt', receipt)
//           break
//         } catch (e) {
//           console.warn((e as Error).message)
//         }
//         const fullTx = await publicClients.suaveLocal.getTransaction({ hash })
//         console.log('(pending) fullTx', fullTx)
//       }
//     }
//   },
// })

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

async function testSendCCRequest() {
  const gasPrice = await publicClients.suaveLocal.getGasPrice()
  const fundTx: TransactionRequestSuave = {
    type: '0x0',
    value: 100000000000000001n, // 0.1 ETH, 1 wei extra to make the resulting balance act like a nonce if tx succeeds
    gasPrice: gasPrice + 1000000000n,
    chainId: suaveRigil.id,
    to: wallet.account.address,
    gas: 21000n,
  }
  // simulate tx first
  const fundSim = await publicClients.suaveLocal.call({
    account: adminWallet.account.address,
    from: adminWallet.account.address,
    ...fundTx,
  })
  console.log('simulated fund tx', fundSim)

  // send fund tx
  const fund = await adminWallet.sendTransaction(fundTx)
  console.log('sent fund tx', fund)

  // wait for fund tx to land
  while (true) {
    try {
      const fundReceipt = await publicClients.suaveLocal.getTransactionReceipt({
        hash: fund,
      })
      if (fundReceipt) {
        console.log('fund tx landed', fundReceipt)
        break
      }
    } catch (e) {
      console.warn((e as Error).message)
    }
    await sleep(4000)
  }

  const ccrReq: TransactionRequestSuave = {
    kettleAddress: KETTLE_ADDRESS,
    confidentialInputs:
      '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000fd7b22626c6f636b4e756d626572223a22307830222c22747873223a5b2230786638363538303064383235323038393463316331313333363833373238626361333233613362313664313938633930323064656535633231383230336538383038343032303131386164613038373866633936666533353930366134323339373235306135356463636135343736633435643538386437303965333330653933353732306233386465663364613034626434373239316635346665666338356532656439323466323637343737326432316266653061616566353030616466326437326531353866396137623933225d2c2270657263656e74223a31307d000000',
    to: '0xE7c7A4CCF98838006130754cADC270B605Ca0230',
    gasPrice: 10000000000n,
    gas: 420000n,
    type: SuaveTxTypes.ConfidentialRequest,
    chainId: suaveRigil.id,
    data: '0x236eb5a70000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000e7c7a4ccf98838006130754cadc270b605ca02300000000000000000000000000000000000000000000000000000000000000000',
    /* TODO: modify default gasPrice and gas
    - not defining them makes eth_estimateGas try & fail
    - it stringifies integer values without hexifying them */
  }
  const res = await wallet.sendTransaction(ccrReq)
  console.log(`sent tx: ${res}`)
}

async function testGettingStuff() {
  const eth = await publicClients.suaveLocal
  // get last 2 blocks
  const latestBlockNum = await eth.getBlockNumber()
  const latestBlocks = [
    await publicClients.suaveLocal.getBlock({
      includeTransactions: false,
      blockNumber: latestBlockNum - 1n,
    }),
    await publicClients.suaveLocal.getBlock({
      includeTransactions: false,
      blockNumber: latestBlockNum,
    }),
  ]
  console.log('latestBlock', latestBlocks)

  // get tx receipt
  for (const block of latestBlocks) {
    const receipt = await publicClients.suaveLocal.getTransactionReceipt({
      hash: block.transactions[0],
    })
    console.log('receipt', receipt)
  }
}

const retryExceptionsWithTimeout = async (timeout_ms: number, fn: () => Promise<any>) => {
  const startTime = new Date().getTime()
  while (true) {
    if (new Date().getTime() - startTime > timeout_ms) {
      console.warn("timed out")
      break
    }
    try {
      const res = await fn()
      return res
    } catch (e) {
      console.warn((e as Error).message)
      await sleep(4000)
    }
  }
}

async function testDeployContract() {
  // deploy contract
  const contractHash = await adminWallet.deployContract({
    abi: ConfidentialWithLogs.abi,
    bytecode: ConfidentialWithLogs.bytecode.object as Hex,
  })

  // wait for tx to land
  const contractAddress: Hex = await retryExceptionsWithTimeout(10 * 1000, async () => {
    const receipt = await publicClients.suaveLocal.getTransactionReceipt({
      hash: contractHash,
    })
    return receipt.contractAddress
  })
  if (!contractAddress) {
    throw new Error('no contract address')
  }
  console.log(`contract deployed at address=${contractAddress} tx_hash=${contractHash}`)

  // send a ccRequest to interact with the contract
  const calldata = encodeFunctionData({
    abi: ConfidentialWithLogs.abi,
    functionName: 'fetchBidConfidentialBundleData',
    args: [],
  })
  const ccrReq: TransactionRequestSuave = {
    type: SuaveTxTypes.ConfidentialRequest,
    chainId: suaveRigil.id,
    gasPrice: 10000000000n,
    gas: 1420000n,
    to: contractAddress,
    data: calldata,
    confidentialInputs: '0x9001',
    kettleAddress: KETTLE_ADDRESS,
  }
  const ccrResult = await adminWallet.sendTransaction(ccrReq)
  console.log('ccrResult', ccrResult)
  retryExceptionsWithTimeout(10 * 1000, async () => {
    const ccrReceipt = await publicClients.suaveLocal.getTransactionReceipt({
      hash: ccrResult,
    })
    console.log('ccrReceipt', ccrReceipt)
  })
}

async function main() {
  // await testSendCCRequest()
  // await testGettingStuff()
  await testDeployContract()
}

main().then(() => {
  console.log('done')
})
