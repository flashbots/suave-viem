import { createPublicClient } from '../../clients/createPublicClient.js'
import { type Hex } from '../../types/misc.js'
import { defineChain } from '../../utils/chain.js'
import { formattersSuave } from '../suave/formatters.js'
import { getSuaveWallet } from '../suave/wallet.js'

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
        http: ['https://testnet.rpc.flashbots.net'],
        webSocket: ['wss://testnet.rpc.flashbots.net'],
      },
      public: {
        http: ['https://testnet.rpc.flashbots.net'],
        webSocket: ['wss://testnet.rpc.flashbots.net'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Explorer',
        url: 'https://testnet.explorer.flashbots.net',
      },
    },
    contracts: {},
    testnet: true,
    newWallet: (transport: any, privateKey: Hex) =>
      getSuaveWallet({ transport, chain: suaveRigil }, privateKey),
    newPublicClient: (transport: any) =>
      createPublicClient({ transport, chain: suaveRigil }),
  },
  {
    formatters: formattersSuave,
    // serializers: serializersSuave,
  },
)
