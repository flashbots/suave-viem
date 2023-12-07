import { Hex } from 'viem'
import { suaveRigil } from "viem/chains"

/** Sets up "connect to wallet" button and holds wallet instance. */
export function setupConnectButton(element: HTMLButtonElement, onConnect: (account: Hex, ethereum: any) => void) {
    let connected = false
    let account = null
    element.innerHTML = `connect to wallet`

    console.log(suaveRigil.id)
    const setConnected = async (ethereum: any) => {
        if (connected) return
        element.innerHTML = `connecting to ${connected}`
        console.log(ethereum)
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
    let txHash = null
    let err = null
    const sendBid = (suaveWallet: any) => {
        // TODO: send real bid
        console.log("got wallet", suaveWallet)
        txHash = "0x2004" as Hex
        err = null

        // callback with result
        onSendBid(txHash, err)
    }
    element.addEventListener('click', () => sendBid(suaveWallet))
}
