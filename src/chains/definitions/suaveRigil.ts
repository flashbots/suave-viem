import type { Address } from 'abitype'
import {
  type PublicClient,
  createPublicClient,
} from '../../clients/createPublicClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { http } from '../../clients/transports/http.js'
import { type Hex } from '../../types/misc.js'
import { defineChain } from '../../utils/chain.js'
import { formattersSuave } from '../suave/formatters.js'
import { type SuaveWallet, getSuaveWallet } from '../suave/wallet.js'

const testnetUrlHttp = 'https://rpc.rigil.suave.flashbots.net'
const testnetUrlWs = 'wss://rpc.rigil.suave.flashbots.net'
const testnetExplorerUrl = 'https://rpc.rigil.suave.flashbots.net'
const defaultTransport = http(testnetUrlHttp)

function getNewWallet<TTransport extends Transport>(params: {
  privateKey?: Hex
  jsonRpcAccount?: Hex
  transport?: TTransport
}): SuaveWallet<TTransport> {
  return getSuaveWallet({
    transport: params.transport ?? defaultTransport,
    privateKey: params.privateKey,
    jsonRpcAccount: params.jsonRpcAccount && {
      address: params.jsonRpcAccount,
      type: 'json-rpc',
    },
  })
}

function getNewPublicClient<TTransport extends Transport>(
  transport?: TTransport,
): PublicClient<TTransport, typeof suaveRigil> {
  return createPublicClient({
    transport: transport ?? defaultTransport,
    chain: suaveRigil,
  })
}

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
    contracts: {
      ANYALLOWED: {
        address: '0xc8df3686b4afb2bb53e60eae97ef043fe03fb829' as Address,
      },
      IS_CONFIDENTIAL_ADDR: {
        address: '0x0000000000000000000000000000000042010000' as Address,
      },
      BUILD_ETH_BLOCK: {
        address: '0x0000000000000000000000000000000042100001' as Address,
      },
      CONFIDENTIAL_INPUTS: {
        address: '0x0000000000000000000000000000000042010001' as Address,
      },
      CONFIDENTIAL_RETRIEVE: {
        address: '0x0000000000000000000000000000000042020001' as Address,
      },
      CONFIDENTIAL_STORE: {
        address: '0x0000000000000000000000000000000042020000' as Address,
      },
      ETHCALL: {
        address: '0x0000000000000000000000000000000042100003' as Address,
      },
      EXTRACT_HINT: {
        address: '0x0000000000000000000000000000000042100037' as Address,
      },
      FETCH_BIDS: {
        address: '0x0000000000000000000000000000000042030001' as Address,
      },
      FILL_MEV_SHARE_BUNDLE: {
        address: '0x0000000000000000000000000000000043200001' as Address,
      },
      NEW_BID: {
        address: '0x0000000000000000000000000000000042030000' as Address,
      },
      SIGN_ETH_TRANSACTION: {
        address: '0x0000000000000000000000000000000040100001' as Address,
      },
      SIMULATE_BUNDLE: {
        address: '0x0000000000000000000000000000000042100000' as Address,
      },
      SUBMIT_BUNDLE_JSON_RPC: {
        address: '0x0000000000000000000000000000000043000001' as Address,
      },
      SUBMIT_ETH_BLOCK_BID_TO_RELAY: {
        address: '0x0000000000000000000000000000000042100002' as Address,
      },
    },
    testnet: true,
    /** Creates a new SUAVE Wallet instance.
     * @example
     * // new wallet with a private key
     * import { suaveRigil } from 'viem/chains'
     * import { http } from 'viem'
     * const wallet = suaveRigil.newWallet({
     *   transport: http('http://localhost:8545'),
     *   privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
     * })
     * @example
     * // new wallet with a json-rpc account using window.ethereum
     * // it's assumed that the wallet is already connected to SUAVE chain
     * import { suaveRigil } from 'viem/chains'
     * import { custom } from 'viem'
     * const wallet = suaveRigil.newWallet({
     *   transport: custom(window.ethereum),
     *   jsonRpcAccount: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
     * })
     */
    newWallet: getNewWallet,
    /** Creates a new SUAVE Public Client instance.
     * @example
     * import { suaveRigil } from 'viem/chains'
     * import { http } from 'viem'
     * const client = suaveRigil.newPublicClient(http('http://localhost:8545'))
     * @example
     * // using window.ethereum
     * import { suaveRigil } from 'viem/chains'
     * import { custom } from 'viem'
     * const client = suaveRigil.newPublicClient(custom(window.ethereum))
     */
    newPublicClient: getNewPublicClient,
  },
  {
    formatters: formattersSuave,
    // serializers: serializersSuave,
  },
)
