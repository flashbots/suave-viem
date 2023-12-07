import './style.css'
import viteLogo from '/vite.svg'
import typescriptLogo from './typescript.svg'
import flashbotsLogo from './flashbots_icon.svg'
import { setupConnectButton, setupSendBidButton } from './suave'
import { Logo } from './components'
import { custom } from 'viem'
import { suaveRigil } from 'viem/chains'

let suaveWallet = null

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    ${Logo('https://suave.flashbots.net', flashbotsLogo, 'Flashbots logo')}
    <h1><em>MEV-Share on SUAVE</em></h1>
    <div class="card">
      <button id="connect" type="button"></button>
      <div id="status-content"></div>
      <button id="sendBid" type="button" ></button>
    </div>
  </div>
`

document.querySelector<HTMLDivElement>('#footer')!.innerHTML = `
  <div>
    built with
      ${Logo('https://vite.org', viteLogo, 'Vite logo', "logo logo-tiny")}
      +${Logo('https://www.typescriptlang.org', typescriptLogo, 'Typescript logo', "logo logo-tiny")}
      +${Logo('https://flashbots.net', flashbotsLogo, 'Flashbots logo', "logo logo-tiny")}
  </div>
`

setupConnectButton(document.querySelector<HTMLButtonElement>('#connect')!, 
(account, ethereum) => {
  suaveWallet = suaveRigil.newWallet({jsonRpcAccount: account, transport: custom(ethereum)})
  console.log(suaveWallet)
  document.querySelector<HTMLDivElement>('#status-content')!.innerHTML = `
    <div>
      <p>suaveWallet: ${suaveWallet.account.address}</p>
    </div>
  `
  // setup "send bid" button once we've connected
  setupSendBidButton(document.querySelector<HTMLButtonElement>('#sendBid')!, suaveWallet, (txHash, err) => {
    if (err) {
      console.error("encountered error trying to send bid.", err)
    }
    console.log("back in main", txHash)
  })
})
