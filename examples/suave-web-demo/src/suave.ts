import { Address, Hex } from 'viem'
import { suaveRigil, goerli } from "viem/chains"
import { MevShareBid } from "../../suave/bids"

// TODO: get this from .env
// TODO: make zero-config script to generate .env (deploy contracts)
const KETTLE_ADDRESS: Address = "0xb5feafbdd752ad52afb7e1bd2e40432a485bbb7f"
const BID_CONTRACT: Address = "0xcb632cC0F166712f09107a7587485f980e524fF6"

/** Sets up "connect to wallet" button and holds wallet instance. */
export function setupConnectButton(element: HTMLButtonElement, onConnect: (account: Hex, ethereum: any) => void) {
    let connected = false
    let account = null
    element.innerHTML = `connect to wallet`

    console.log(suaveRigil.id)
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
        element.addEventListener('click', () => setConnected((window as any).ethereum))
    } else {
        console.error("no ethereum provider detected")
    }
}

export function setupSendBidButton(element: HTMLButtonElement, suaveWallet: any, onSendBid: (txHash: Hex, err?: any) => void) {
    element.innerHTML = `send bid`
    const sendBid = async (suaveWallet: any) => {
        // TODO: send real bid
        console.log("got wallet", suaveWallet)

        try {
            const bid = new MevShareBid(0xf00ba7n, '0xdead', KETTLE_ADDRESS, BID_CONTRACT, goerli.id)
            console.log(bid)
            const ccr = bid.toConfidentialRequest()
            const txHash = await suaveWallet.sendTransaction(ccr)
            console.log("sendResult", txHash)
            // callback with result
            onSendBid(txHash, null)
        } catch (e) {
            return onSendBid('0x', e)
        }
    }
    element.addEventListener('click', () => sendBid(suaveWallet))
}
