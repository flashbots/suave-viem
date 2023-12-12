import { sleep } from 'bun'
import { http, Address, Hex, createPublicClient, formatEther, isHex } from 'viem'
import { goerli, suaveRigil } from 'viem/chains'
import { TransactionRequestSuave } from 'viem/chains/suave/types'
import { MevShareBid } from 'bids'
import { SuaveProvider, SuaveWallet, getSuaveProvider, getSuaveWallet } from 'viem/chains/utils'
import { HttpTransport } from 'viem'
import BidContractDeployment from './deployedAddress.json'

const failEnv = (name: string) => {
  throw new Error(`missing env var ${name}`)
}
if (!process.env.PRIVATE_KEY) {
  failEnv('PRIVATE_KEY')
}
if (!process.env.KETTLE_ADDRESS) {
  failEnv('KETTLE_ADDRESS')
}
if (!process.env.SUAVE_RPC_URL_HTTP) {
  console.warn('SUAVE_RPC_URL_HTTP not set. Defaulting to localhost:8545')
}
if (!process.env.GOERLI_RPC_URL_HTTP) {
  console.warn('GOERLI_RPC_URL_HTTP not set. Defaulting to localhost:8545')
}
const KETTLE_ADDRESS: Address = process.env.KETTLE_ADDRESS as Address
const PRIVATE_KEY: Hex = process.env.PRIVATE_KEY as Hex
const SUAVE_RPC_URL_HTTP: string =
  process.env.SUAVE_RPC_URL_HTTP || 'http://localhost:8545'
const GOERLI_RPC_URL_HTTP: string =
  process.env.GOERLI_RPC_URL_HTTP || 'http://localhost:8545'

const suaveProvider: SuaveProvider<HttpTransport> = getSuaveProvider(http(SUAVE_RPC_URL_HTTP))
const goerliProvider = createPublicClient({
  chain: goerli,
  transport: http(GOERLI_RPC_URL_HTTP),
})
const adminWallet: SuaveWallet<HttpTransport> = getSuaveWallet({
  transport: http(SUAVE_RPC_URL_HTTP),
  privateKey: PRIVATE_KEY, 
})
const wallet = getSuaveWallet({
  transport: http(SUAVE_RPC_URL_HTTP),
  privateKey: '0x01000070530220062104600650003002001814120800043ff33603df10300012',
})
console.log('admin', adminWallet.account.address)
console.log('wallet', wallet.account.address)

const retryExceptionsWithTimeout = async (
  timeout_ms: number,
  fn: () => Promise<any>,
) => {
  const startTime = new Date().getTime()
  while (true) {
    if (new Date().getTime() - startTime > timeout_ms) {
      console.warn('timed out')
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

/** Send `amount` to `wallet` from admin wallet. */
const fundAccount = async (wallet: Address, amount: bigint) => {
  const balance = await suaveProvider.getBalance({ address: wallet })
  if (balance < amount) {
    const tx: TransactionRequestSuave = {
      value: amount,
      type: '0x0',
      gasPrice: 10000000000n,
      gas: 21000n,
      to: wallet,
    }
    return await adminWallet.sendTransaction(tx)
  } else {
    console.log(`wallet balance: ${formatEther(balance)} ETH`)
  }
}

/** MEV-Share implementation on SUAVE.
 *
 * To run this, you'll need to deploy the contract first.
 * See the [README](./README.md) for instructions.
 */
async function testSuaveBids() {
  if (!BidContractDeployment.address) {
    console.error(
      'Need to run the DeployContracts script first. See ./README.md for instructions.',
    )
    failEnv('BID_CONTRACT_ADDRESS')
  }
  if (!isHex(BidContractDeployment.address)) {
    console.error('BID_CONTRACT_ADDRESS is not a hex string')
    failEnv('BID_CONTRACT_ADDRESS')
  }
  const BID_CONTRACT_ADDRESS = BidContractDeployment.address as Hex

  // fund our test wallet w/ 1 ETH
  const fundRes = await fundAccount(
    wallet.account.address,
    1000000000000000000n,
  )
  fundRes && console.log('fundRes', fundRes)

  // a tx that should be landed on goerli
  const testTx = {
    to: '0x0000000000000000000000000000000000000000' as Address,
    data: '0x686f776479' as Hex,
    gas: 26000n,
    gasPrice: 10000000000n,
    chainId: 5,
    type: '0x0' as const,
  }
  const signedTx = await wallet.signTransaction(testTx)

  // create bid & send ccr
  const block = await goerliProvider.getBlockNumber()
  const bid = new MevShareBid(
    block + 1n,
    signedTx,
    KETTLE_ADDRESS,
    BID_CONTRACT_ADDRESS,
    suaveRigil.id,
  )
  const ccr = bid.toConfidentialRequest()
  const ccrRes = await wallet.sendTransaction(ccr)
  console.log('ccrRes', ccrRes)

  // wait for ccr to land and get tx receipt
  const ccrReceipt = await retryExceptionsWithTimeout(10 * 1000, async () => {
    const receipt = await suaveProvider.getTransactionReceipt({
      hash: ccrRes,
    })
    return receipt
  })
  console.log('ccrReceipt', ccrReceipt)

  // get tx too
  const ccrTx = await suaveProvider.getTransaction({ hash: ccrRes })
  console.log('ccrTx', ccrTx)
}

async function main() {
  await testSuaveBids()
}

main().then(() => {
  console.log('done')
})
