import type { Address } from 'abitype'
import { defineChain } from '../../utils/chain.js'
import { formattersSuave } from '../suave/formatters.js'

const suaveChainConfig = ({networkName, chainId, currencySymbol}: {networkName: string, chainId: number, currencySymbol: string}) => {
    const networkNamePascal = `${networkName[0].toUpperCase()}${networkName.substring(1)}`
    const networkRpc = `rpc.${networkName}.suave.flashbots.net`
    const networkUrlHttp = `https://${networkRpc}`
    const networkUrlWs = `wss://${networkRpc}`
    const explorerUrl = `https://explorer.${networkName}.suave.flashbots.net/`

    return {
        id: chainId,
        name: `Suave ${networkNamePascal} Testnet`,
        network: `${networkName}-testnet`,
        nativeCurrency: {
            decimals: 18,
            name: `${networkNamePascal} ETH`,
            symbol: currencySymbol,
        },
        rpcUrls: {
            default: {
                http: [networkUrlHttp],
                webSocket: [networkUrlWs],
            },
            public: {
                http: [networkUrlHttp],
                webSocket: [networkUrlWs],
            },
        },
        blockExplorers: {
            default: {
                name: `SUAVE ${networkNamePascal} Explorer`,
                url: explorerUrl,
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
  }
}

export const suaveToliman = /*#__PURE__*/ defineChain(
  suaveChainConfig({
    networkName: "toliman",
    chainId: 33626250,
    currencySymbol: "TEETH",
  }),
  {
    formatters: formattersSuave,
    // serializers: serializersSuave,
  },
)

export const suaveRigil = /*#__PURE__*/ defineChain(
    suaveChainConfig({
        networkName: "rigil",
        chainId: 16813125,
        currencySymbol: "RETH",
    }),
    {
        formatters: formattersSuave,
        // serializers: serializersSuave,
    },
)