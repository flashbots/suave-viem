import { sleep } from 'bun'
import { http, Address, Hex, createPublicClient, createWalletClient, Chain, formatEther, isHex } from '@flashbots/suave-viem'
import { privateKeyToAccount } from '@flashbots/suave-viem/accounts'
import { suaveRigil } from '@flashbots/suave-viem/chains'
import { TransactionRequestSuave } from '@flashbots/suave-viem/chains/utils'
import { OFAOrder } from './bids'
import { SuaveProvider, SuaveWallet, getSuaveProvider, getSuaveWallet, parseTransactionSuave } from '@flashbots/suave-viem/chains/utils'
import { HttpTransport } from '@flashbots/suave-viem'
import BidContractDeployment from './deployedAddress.json'

const localhostChain = {
  name: 'localhost',
  id: 17000, // chainId suave expects (note this is not necessarily the actual chainId of the L1 chain; results may vary by testing environment)
} as Chain

const DEFAULT_KETTLE_ADDRESS = '0xb5feafbdd752ad52afb7e1bd2e40432a485bbb7f' as Address
const DEFAULT_SUAVE_RPC_URL_HTTP = 'http://localhost:8545'
const DEFAULT_L1_RPC_URL_HTTP = 'http://localhost:8555'

const failEnv = (name: string) => {
  throw new Error(`missing env var ${name}`)
}

if (!process.env.PRIVATE_KEY) {
  failEnv('PRIVATE_KEY')
}

if (!process.env.KETTLE_ADDRESS) {
  console.warn(`KETTLE_ADDRESS not set. Defaulting to ${DEFAULT_KETTLE_ADDRESS}`)
}

if (!process.env.SUAVE_RPC_URL_HTTP) {
  console.warn(`SUAVE_RPC_URL_HTTP not set. Defaulting to ${DEFAULT_SUAVE_RPC_URL_HTTP}`)
}

if (!process.env.L1_RPC_URL_HTTP) {
  console.warn(`L1_RPC_URL_HTTP not set. Defaulting to ${DEFAULT_L1_RPC_URL_HTTP}`)
}
const KETTLE_ADDRESS: Address = process.env.KETTLE_ADDRESS as Address || DEFAULT_KETTLE_ADDRESS
const PRIVATE_KEY: Hex = process.env.PRIVATE_KEY as Hex
const SUAVE_RPC_URL_HTTP: string =
  process.env.SUAVE_RPC_URL_HTTP || 'http://localhost:8545'
const L1_RPC_URL_HTTP: string =
  process.env.L1_RPC_URL_HTTP || 'http://localhost:8555'
const L1_PRIVATE_KEY: Hex = '0x6c45335a22461ccdb978b78ab61b238bad2fae4544fb55c14eb096c875ccfc52'

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

const suaveProvider: SuaveProvider<HttpTransport> = getSuaveProvider(http(SUAVE_RPC_URL_HTTP))
const l1Provider = createPublicClient({
  chain: localhostChain,
  transport: http(L1_RPC_URL_HTTP),
})
const adminWallet: SuaveWallet<HttpTransport> = getSuaveWallet({
  transport: http(SUAVE_RPC_URL_HTTP),
  privateKey: PRIVATE_KEY,
  chain: suaveRigil,
})
const wallet = getSuaveWallet({
  transport: http(SUAVE_RPC_URL_HTTP),
  privateKey: PRIVATE_KEY,
  chain: suaveRigil,
})
const l1Wallet = createWalletClient({
  account: privateKeyToAccount(L1_PRIVATE_KEY),
  transport: http(L1_RPC_URL_HTTP),
  chain: localhostChain,
})
console.log('admin', adminWallet.account.address)
console.log('wallet', wallet.account.address)
console.log('wallet chain id', wallet.chain.id)

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
      kettleAddress: KETTLE_ADDRESS,
    }
    return await adminWallet.sendTransaction(tx)
  } else {
    console.log(`SUAVE wallet balance: ${formatEther(balance)} ETH`)
  }
}

/** MEV-Share implementation on SUAVE.
 *
 * To run this, you'll need to deploy the contract first.
 * See the [README](./README.md) for instructions.
 */
async function testSuaveBids() {
  // fund our test wallet w/ 1 ETH
  const fundRes = await fundAccount(
    wallet.account.address,
    1000000000000000000n,
  )
  fundRes && console.log('fundRes', fundRes)

  // a tx that should be landed on L1
  const testTx = {
    to: '0x0000000000000000000000000000000000000000' as Address,
    data: '0x686f776479' as Hex,
    gas: 26000n,
    gasPrice: 10000000000n,
    chainId: 1337, // chainId of localhost
  }
  const signedTx = await l1Wallet.signTransaction(testTx)

  console.log("signed tx", signedTx)

  // create bid & send ccr
  const block = await l1Provider.getBlockNumber()
  const bid = new OFAOrder(
    block + 1n,
    signedTx,
    KETTLE_ADDRESS,
    BID_CONTRACT_ADDRESS,
  )
  const ccr = bid.toConfidentialRequest() // signs w/ EIP712 by default; pass `false` to use legacy CCR
  console.log('ccr', ccr)

  const signedCcr = await wallet.signTransaction(ccr)
  console.log("signedCcr", signedCcr)
  const deserCcr = await parseTransactionSuave(signedCcr)
  console.log("deserialized signed ccr", deserCcr)

  // deserCcr should be the same as ccr, but with any missing fields filled in, such as gasPrice & nonce

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
