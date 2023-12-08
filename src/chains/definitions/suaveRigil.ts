import { createPublicClient } from '../../clients/createPublicClient.js'
import { type Transport } from '../../clients/transports/createTransport.js'
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
    newWallet: (privateKey: Hex, transport?: Transport) =>
      getSuaveWallet(
        {
          transport: transport ?? defaultTransport,
          chain: suaveRigil,
        },
        privateKey,
      ),
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
