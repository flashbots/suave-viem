import { http, Address, Hex, createPublicClient, formatEther, encodeFunctionData, encodeAbiParameters, parseAbi, concatHex, keccak256, getFunctionSelector, decodeAbiParameters, decodeEventLog, decodeErrorResult, padHex, toHex } from 'viem'
import { goerli, suaveRigil } from 'viem/chains'
import { SuaveTxTypes, TransactionReceiptSuave, TransactionRequestSuave } from 'viem/chains/suave/types'
import { MevShareBid } from 'lib/bid'
import IntentsContract from './contracts/out/Intents.sol/Intents.json'
import { deployContract } from 'viem/actions/wallet/deployContract'
import { LimitOrder } from 'lib/limitOrder'
import { SuaveRevert } from 'lib/suave'

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

const suaveProvider = suaveRigil.newPublicClient(http(SUAVE_RPC_URL_HTTP))
const goerliProvider = createPublicClient({
  chain: goerli,
  transport: http(GOERLI_RPC_URL_HTTP),
})
const adminWallet = suaveRigil.newWallet(PRIVATE_KEY, http(SUAVE_RPC_URL_HTTP))
const wallet = suaveRigil.newWallet(
  '0x01000070530220062104600650003002001814120800043ff33603df10300012',
  http(SUAVE_RPC_URL_HTTP),
)
console.log('admin', adminWallet.account.address)
console.log('wallet', wallet.account.address)

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
  const BID_CONTRACT_ADDRESS = process.env.BID_CONTRACT_ADDRESS as Hex
  if (!BID_CONTRACT_ADDRESS) {
    console.error(
      'Need to run the DeployContracts script first. See ./README.md for instructions.',
    )
    failEnv('BID_CONTRACT_ADDRESS')
  }

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
    type: '0x0' as '0x0',
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
  const ccrReceipt = await suaveProvider.waitForTransactionReceipt({
    hash: ccrRes,
  })
  console.log('ccrReceipt', ccrReceipt)
}

async function testIntents() {
  const deployContractTxHash = await deployContract(adminWallet, {abi: IntentsContract.abi, bytecode: IntentsContract.bytecode.object as Hex})
  const receipt: TransactionReceiptSuave = await suaveProvider.waitForTransactionReceipt({hash: deployContractTxHash})
  console.log(`contract deployed at tx ${deployContractTxHash}\ncontract_address: ${receipt.contractAddress}`)
  if (!receipt.contractAddress) {
    throw new Error('no contract address')
  }

  // TODO: use another account
  const senderKey = '0x91ab9a7e53c220e6210460b65a7a3bb2ca181412a8a7b43ff336b3df1737ce12' // adminWallet
  const limitOrder = new LimitOrder({
    amountInMax: 13n,
    amountOutMin: 14n,
    expiryTimestamp: 0x65665489n,
    senderKey: senderKey as Hex,
    tokenIn: '0xea7ea7ea7ea7ea7ea7ea7ea7ea7ea7ea7ea7eea7' as Hex,
    tokenOut: '0xf00d0f00d0f00d0f00d0f00d0f00d0f00d0f000d' as Hex,
  }, suaveProvider, receipt.contractAddress, KETTLE_ADDRESS)

  const tx = await limitOrder.toTransactionRequest()
  let limitOrderTxHash: Hex = '0x'
  try {
    limitOrderTxHash = await adminWallet.sendTransaction(tx)
  } catch (e) {
    // TODO: would be nice to have this as the default response in the client
    throw new SuaveRevert(e as Error)
  }

  const ccrReceipt = await suaveProvider.waitForTransactionReceipt({hash: limitOrderTxHash})
  console.log("ccrReceipt", ccrReceipt)
  const txRes = await suaveProvider.getTransaction({hash: limitOrderTxHash})
  console.log("txRes", txRes)

  if (txRes.type !== SuaveTxTypes.Suave) {
    throw new Error('expected SuaveTransaction type (0x50)')
  }

  // check `confidentialComputeResult`; should be calldata for `onReceivedIntent`
  const fnSelector: Hex = `0x${IntentsContract.methodIdentifiers['onReceivedIntent((address,address,uint256,uint256,uint256),bytes32)']}`
  const expectedData = [
    limitOrder.tokenIn,
    limitOrder.tokenOut,
    toHex(limitOrder.amountInMax),
    toHex(limitOrder.amountOutMin),
    toHex(limitOrder.expiryTimestamp),
    limitOrder.hashkey(),
  ].map(
    param => padHex(param, {size: 32})
  ).reduce(
    (acc, cur) => concatHex([acc, cur])
  )
  const expectedRawResult = concatHex([fnSelector, expectedData])
  if (txRes.confidentialComputeResult !== expectedRawResult) {
    throw new Error('expected confidential compute result to be calldata for `onReceivedIntent`')
  }

  // TODO: check onchain for intent
  const intentResult = await suaveProvider.call({
    account: adminWallet.account.address,
    to: receipt.contractAddress,
    data: encodeFunctionData({
      abi: IntentsContract.abi,
      args: [limitOrder.hashkey()],
      functionName: 'intents_pending'
    }),
    gasPrice: 10000000000n,
    gas: 42000n,
    type: '0x0'
  })
  console.log('intentResult', intentResult)
}

async function main() {
  // await testSuaveBids()
  await testIntents()
}

main().then(() => {
  console.log('done')
})
