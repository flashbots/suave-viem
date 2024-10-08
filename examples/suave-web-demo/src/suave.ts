import {
  Address,
  Hex,
  createPublicClient,
  createWalletClient,
  http,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { holesky as l1Chain, suaveRigil } from 'viem/chains'
import { OFAOrder } from '../../suave/bids'
import { getSuaveWallet } from 'viem/chains/utils'
import BidContractDeployment from '../../suave/deployedAddress.json'

// defaults for local suave-geth devnet:
const KETTLE_ADDRESS: Address = '0xb5feafbdd752ad52afb7e1bd2e40432a485bbb7f'
const ADMIN_KEY: Hex =
  '0x91ab9a7e53c220e6210460b65a7a3bb2ca181412a8a7b43ff336b3df1737ce12'
export const L1_RPC_URL_HTTP: string = 'https://holesky.toliman.suave.flashbots.net'
export const SUAVE_RPC_URL_HTTP: string = 'http://localhost:8545'

const l1Wallet = createWalletClient({
  account: privateKeyToAccount(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: l1Chain,
  transport: http(L1_RPC_URL_HTTP),
})
const l1Provider = createPublicClient({
  chain: l1Chain,
  transport: http(L1_RPC_URL_HTTP),
})
const suaveAdminWallet = getSuaveWallet({
  privateKey: ADMIN_KEY,
  transport: http(SUAVE_RPC_URL_HTTP),
  chain: suaveRigil,
})

/** Sets up "connect to wallet" button and holds wallet instance. */
export function setupConnectButton(
  element: HTMLButtonElement,
  onConnect: (account: Hex, ethereum: any, err?: any) => void,
) {
  let connected = false
  let account = null
  element.innerHTML = 'connect to wallet'

  const setConnected = async (ethereum: any) => {
    if (connected) return
    element.innerHTML = `connecting to ${connected}`
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    account = accounts[0]
    element.innerHTML = `connected with ${account}`
    connected = true
    onConnect(account, ethereum)
  }

  if ('ethereum' in window) {
    element.addEventListener('click', () =>
      setConnected((window as any).ethereum),
    )
  } else {
    return onConnect('0x', null, new Error('window.ethereum not found'))
  }
}

export function setupSendBidButton(
  element: HTMLButtonElement,
  suaveWallet: any,
  onSendBid: (txHash: Hex, err?: any) => void,
) {
  element.innerHTML = 'send bid'
  const sendBid = async (suaveWallet: any) => {
    // create sample transaction; won't land onchain, but will pass payload validation
    const sampleTx = {
      type: 'eip1559' as const,
      chainId: 17000,
      nonce: 0,
      maxBaseFeePerGas: 0x3b9aca00n,
      maxPriorityFeePerGas: 0x5208n,
      to: '0x0000000000000000000000000000000000000000' as Address,
      value: 0n,
      data: '0xf00ba7' as Hex,
    }
    const signedTx = await l1Wallet.signTransaction(sampleTx)
    console.log('signed L1 tx', signedTx)

    // create bid & send ccr
    const decryptionCondition = (await l1Provider.getBlockNumber())
    console.log("decryptionCondition", decryptionCondition)
    const bid = new OFAOrder(
      decryptionCondition,
      signedTx,
      KETTLE_ADDRESS,
      BidContractDeployment.address as Address,
    )
    const ccr = bid.toConfidentialRequest()
    console.log("ccr", ccr)
    let txHash: Hex
    try {
      txHash = await suaveWallet.sendTransaction(ccr)
      console.log('sendResult', txHash)
      // callback with result
    } catch (err) {
      return onSendBid('0x', err)
    }
    return onSendBid(txHash)
  }
  element.addEventListener('click', () => sendBid(suaveWallet))
}

export function setupDripFaucetButton(
  element: HTMLButtonElement,
  account: Address,
  onFaucet: (txHash: Hex, err?: any) => void,
) {
  element.innerHTML = "get 0.5 SUAVE-ETH"
  const getEth = async () => {
    const fundTxRequest = {
      to: account,
      value: 500000000000000000n,
      gas: 21000n,
      gasPrice: 10000000000n,
      type: '0x0' as const,
    }
    try {
      const fundTxHash = await suaveAdminWallet.sendTransaction(fundTxRequest)
      console.log('fundRes', fundTxHash)
      onFaucet(fundTxHash)
    } catch (e) {
      return onFaucet('0x', e)
    }
  }
  element.addEventListener('click', () => getEth())
}
