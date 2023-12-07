import './style.css'
import viteLogo from '/vite.svg'
import typescriptLogo from './typescript.svg'
import flashbotsLogo from './flashbots_icon.svg'
import { connectToWallet } from './suave'
import { Logo } from './components'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    ${Logo('https://suave.flashbots.net', flashbotsLogo, 'Flashbots logo')}
    <h1><em>MEV-Share on SUAVE</em></h1>
    <div class="card">
      <button id="connect" type="button"></button>
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

connectToWallet(document.querySelector<HTMLButtonElement>('#connect')!)
