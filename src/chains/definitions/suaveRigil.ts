import { createPublicClient } from '../../clients/createPublicClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { http } from '../../clients/transports/http.js'
import { type Hex } from '../../types/misc.js'
import { defineChain } from '../../utils/chain.js'
import { formattersSuave } from '../suave/formatters.js'
import { getSuaveWallet } from '../suave/wallet.js'

const testnetUrlHttp = 'https://rpc.rigil.suave.flashbots.net'
const testnetUrlWs = 'wss://rpc.rigil.suave.flashbots.net'
const testnetExplorerUrl = 'https://rpc.rigil.suave.flashbots.net'

const defaultTransport = http(testnetUrlHttp)

export const suaveRigil = /*#__PURE__*/ defineChain(
  {
    id: 16813125,
    name: 'Suave Rigil Testnet',
    network: 'rigil-testnet',
    nativeCurrency: {
      decimals: 18,
      name: 'Suave Goerli',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: [testnetUrlHttp],
        webSocket: [testnetUrlWs],
      },
      public: {
        http: [testnetUrlHttp],
        webSocket: [testnetUrlWs],
      },
    },
    blockExplorers: {
      default: {
        name: 'SUAVE Rigil Explorer',
        url: testnetExplorerUrl,
      },
    },
    contracts: {},
    testnet: true,
    /** Creates a new SUAVE Wallet instance.
     * @example
      // new wallet with a private key
      import { suaveRigil } from 'viem/chains'
      import { http } from 'viem'
      const wallet = suaveRigil.newWallet({
         transport: http('http://localhost:8545'),
         privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      })
     * @example
      // new wallet with a json-rpc account using window.ethereum
      // it's assumed that the wallet is already connected to SUAVE chain
      import { suaveRigil } from 'viem/chains'
      import { custom } from 'viem'
      const wallet = suaveRigil.newWallet({
        transport: custom(window.ethereum),
        jsonRpcAccount: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      })
     */
    newWallet: (params: {
      privateKey?: Hex
      jsonRpcAccount?: Hex
      transport?: Transport
    }) =>
      getSuaveWallet({
        transport: params.transport ?? defaultTransport,
        chain: suaveRigil,
        privateKey: params.privateKey,
        jsonRpcAccount: params.jsonRpcAccount && {
          address: params.jsonRpcAccount,
          type: 'json-rpc',
        },
      }),
    /** Creates a new SUAVE Public Client instance.
     * @example
      import { suaveRigil } from 'viem/chains'
      import { http } from 'viem'
      const client = suaveRigil.newPublicClient(http('http://localhost:8545'))
     * @example
      // using window.ethereum
      import { suaveRigil } from 'viem/chains'
      import { custom } from 'viem'
      const client = suaveRigil.newPublicClient(custom(window.ethereum))
     */
    newPublicClient: (transport?: Transport) =>
      createPublicClient({
        transport: transport ?? defaultTransport,
        chain: suaveRigil,
      }),
  },
  {
    formatters: formattersSuave,
    // serializers: serializersSuave,
  },
)
