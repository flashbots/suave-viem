export function connectToWallet(element: HTMLButtonElement) {
    let connected = false
    let account = null
    element.innerHTML = `connect to wallet`
    const setConnected = (ethereum: any) => {
        if (connected) return
        connected = true
        element.innerHTML = `connecting to ${connected}`
        console.log(ethereum)
        ethereum.request({ method: 'eth_requestAccounts' }).then((accounts: any) => {
            account = accounts[0]
            element.innerHTML = `connected with ${account}`
        })
    }
    if ('ethereum' in window) {
        element.addEventListener('click', () => setConnected((window as any).ethereum))
    } else {
        console.error("no ethereum provider detected")
    }
}
