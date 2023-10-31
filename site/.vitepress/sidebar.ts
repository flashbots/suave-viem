import { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Sidebar = {
  '/docs/': [
    {
      text: 'Introduction',
      items: [
        { text: 'Why viem', link: '/docs/introduction' },
        { text: 'Getting Started', link: '/docs/getting-started' },
        { text: 'Migration Guide', link: '/docs/migration-guide' },
        { text: 'Ethers v5 → viem', link: '/docs/ethers-migration' },
        { text: 'TypeScript', link: '/docs/typescript' },
        { text: 'Error Handling', link: '/docs/error-handling' },
        { text: 'Platform Compatibility', link: '/docs/compatibility' },
        { text: 'FAQ', link: '/docs/faq' },
      ],
    },
    {
      text: 'Clients & Transports',
      items: [
        { text: 'Introduction', link: '/docs/clients/intro' },
        { text: 'Public Client', link: '/docs/clients/public' },
        { text: 'Wallet Client', link: '/docs/clients/wallet' },
        { text: 'Test Client', link: '/docs/clients/test' },
        { text: 'Build your own Client', link: '/docs/clients/custom' },
        {
          text: 'Transports',
          items: [
            {
              text: 'HTTP',
              link: '/docs/clients/transports/http',
            },
            {
              text: 'WebSocket',
              link: '/docs/clients/transports/websocket',
            },
            {
              text: 'Custom (EIP-1193)',
              link: '/docs/clients/transports/custom',
            },
            {
              text: 'Fallback',
              link: '/docs/clients/transports/fallback',
            },
          ],
        },
        { text: 'Chains', link: '/docs/clients/chains' },
      ],
    },
    {
      text: 'Public Actions',
      collapsed: true,
      items: [
        { text: 'Introduction', link: '/docs/actions/public/introduction' },
        {
          text: 'Account',
          items: [
            {
              text: 'getBalance',
              link: '/docs/actions/public/getBalance',
            },
            {
              text: 'getTransactionCount',
              link: '/docs/actions/public/getTransactionCount',
            },
          ],
        },
        {
          text: 'Block',
          items: [
            { text: 'getBlock', link: '/docs/actions/public/getBlock' },
            {
              text: 'getBlockNumber',
              link: '/docs/actions/public/getBlockNumber',
            },
            {
              text: 'getBlockTransactionCount',
              link: '/docs/actions/public/getBlockTransactionCount',
            },
            {
              text: 'watchBlockNumber',
              link: '/docs/actions/public/watchBlockNumber',
            },
            {
              text: 'watchBlocks',
              link: '/docs/actions/public/watchBlocks',
            },
          ],
        },
        {
          text: 'Chain',
          items: [
            { text: 'getChainId', link: '/docs/actions/public/getChainId' },
          ],
        },
        {
          text: 'Fee',
          items: [
            {
              text: 'estimateFeesPerGas',
              link: '/docs/actions/public/estimateFeesPerGas',
            },
            {
              text: 'estimateGas',
              link: '/docs/actions/public/estimateGas',
            },
            {
              text: 'estimateMaxPriorityFeePerGas',
              link: '/docs/actions/public/estimateMaxPriorityFeePerGas',
            },
            {
              text: 'getFeeHistory',
              link: '/docs/actions/public/getFeeHistory',
            },
            {
              text: 'getGasPrice',
              link: '/docs/actions/public/getGasPrice',
            },
          ],
        },
        {
          text: 'Filters & Logs',
          items: [
            {
              text: 'createBlockFilter',
              link: '/docs/actions/public/createBlockFilter',
            },
            {
              text: 'createEventFilter',
              link: '/docs/actions/public/createEventFilter',
            },
            {
              text: 'createPendingTransactionFilter',
              link: '/docs/actions/public/createPendingTransactionFilter',
            },
            {
              text: 'getFilterChanges',
              link: '/docs/actions/public/getFilterChanges',
            },
            {
              text: 'getFilterLogs',
              link: '/docs/actions/public/getFilterLogs',
            },
            {
              text: 'getLogs',
              link: '/docs/actions/public/getLogs',
            },
            {
              text: 'watchEvent',
              link: '/docs/actions/public/watchEvent',
            },
            {
              text: 'uninstallFilter',
              link: '/docs/actions/public/uninstallFilter',
            },
          ],
        },
        {
          text: 'Signature',
          items: [
            {
              text: 'verifyMessage',
              link: '/docs/actions/public/verifyMessage',
            },
            {
              text: 'verifyTypedData',
              link: '/docs/actions/public/verifyTypedData',
            },
          ],
        },
        {
          text: 'Transaction',
          items: [
            { text: 'call', link: '/docs/actions/public/call' },
            {
              text: 'prepareTransactionRequest',
              link: '/docs/actions/wallet/prepareTransactionRequest',
            },
            {
              text: 'getTransaction',
              link: '/docs/actions/public/getTransaction',
            },
            {
              text: 'getTransactionConfirmations',
              link: '/docs/actions/public/getTransactionConfirmations',
            },
            {
              text: 'getTransactionReceipt',
              link: '/docs/actions/public/getTransactionReceipt',
            },
            {
              text: 'sendRawTransaction',
              link: '/docs/actions/wallet/sendRawTransaction',
            },
            {
              text: 'waitForTransactionReceipt',
              link: '/docs/actions/public/waitForTransactionReceipt',
            },
            {
              text: 'watchPendingTransactions',
              link: '/docs/actions/public/watchPendingTransactions',
            },
          ],
        },
      ],
    },
    {
      text: 'Wallet Actions',
      collapsed: true,
      items: [
        { text: 'Introduction', link: '/docs/actions/wallet/introduction' },
        {
          text: 'Account',
          items: [
            {
              text: 'getAddresses',
              link: '/docs/actions/wallet/getAddresses',
            },
            {
              text: 'requestAddresses',
              link: '/docs/actions/wallet/requestAddresses',
            },
          ],
        },
        {
          text: 'Assets',
          items: [
            {
              text: 'watchAsset',
              link: '/docs/actions/wallet/watchAsset',
            },
          ],
        },
        {
          text: 'Chain',
          items: [
            {
              text: 'addChain',
              link: '/docs/actions/wallet/addChain',
            },
            {
              text: 'switchChain',
              link: '/docs/actions/wallet/switchChain',
            },
          ],
        },
        {
          text: 'Data',
          items: [
            {
              text: 'signMessage',
              link: '/docs/actions/wallet/signMessage',
            },
            {
              text: 'signTypedData',
              link: '/docs/actions/wallet/signTypedData',
            },
          ],
        },
        {
          text: 'Permissions',
          items: [
            {
              text: 'getPermissions',
              link: '/docs/actions/wallet/getPermissions',
            },
            {
              text: 'requestPermissions',
              link: '/docs/actions/wallet/requestPermissions',
            },
          ],
        },
        {
          text: 'Transaction',
          items: [
            {
              text: 'prepareTransactionRequest',
              link: '/docs/actions/wallet/prepareTransactionRequest',
            },
            {
              text: 'sendRawTransaction',
              link: '/docs/actions/wallet/sendRawTransaction',
            },
            {
              text: 'sendTransaction',
              link: '/docs/actions/wallet/sendTransaction',
            },
            {
              text: 'signTransaction',
              link: '/docs/actions/wallet/signTransaction',
            },
          ],
        },
      ],
    },
    {
      text: 'Test Actions',
      collapsed: true,
      items: [
        { text: 'Introduction', link: '/docs/actions/test/introduction' },
        {
          text: 'Account',
          items: [
            {
              text: 'impersonateAccount',
              link: '/docs/actions/test/impersonateAccount',
            },
            { text: 'setBalance', link: '/docs/actions/test/setBalance' },
            { text: 'setCode', link: '/docs/actions/test/setCode' },
            { text: 'setNonce', link: '/docs/actions/test/setNonce' },
            {
              text: 'setStorageAt',
              link: '/docs/actions/test/setStorageAt',
            },
            {
              text: 'stopImpersonatingAccount',
              link: '/docs/actions/test/stopImpersonatingAccount',
            },
          ],
        },
        {
          text: 'Block',
          items: [
            { text: 'getAutomine', link: '/docs/actions/test/getAutomine' },
            {
              text: 'increaseTime',
              link: '/docs/actions/test/increaseTime',
            },
            { text: 'mine', link: '/docs/actions/test/mine' },
            {
              text: 'removeBlockTimestampInterval',
              link: '/docs/actions/test/removeBlockTimestampInterval',
            },
            { text: 'setAutomine', link: '/docs/actions/test/setAutomine' },
            {
              text: 'setIntervalMining',
              link: '/docs/actions/test/setIntervalMining',
            },
            {
              text: 'setBlockTimestampInterval',
              link: '/docs/actions/test/setBlockTimestampInterval',
            },
            {
              text: 'setBlockGasLimit',
              link: '/docs/actions/test/setBlockGasLimit',
            },
            {
              text: 'setNextBlockBaseFeePerGas',
              link: '/docs/actions/test/setNextBlockBaseFeePerGas',
            },
            {
              text: 'setNextBlockTimestamp',
              link: '/docs/actions/test/setNextBlockTimestamp',
            },
          ],
        },
        {
          text: 'Node',
          items: [
            { text: 'setCoinbase', link: '/docs/actions/test/setCoinbase' },
            {
              text: 'setMinGasPrice',
              link: '/docs/actions/test/setMinGasPrice',
            },
          ],
        },
        {
          text: 'Settings',
          items: [
            { text: 'reset', link: '/docs/actions/test/reset' },
            {
              text: 'setLoggingEnabled',
              link: '/docs/actions/test/setLoggingEnabled',
            },
            { text: 'setRpcUrl', link: '/docs/actions/test/setRpcUrl' },
          ],
        },
        {
          text: 'State',
          items: [
            { text: 'revert', link: '/docs/actions/test/revert' },
            { text: 'snapshot', link: '/docs/actions/test/snapshot' },
          ],
        },
        {
          text: 'Transaction',
          items: [
            {
              text: 'dropTransaction',
              link: '/docs/actions/test/dropTransaction',
            },
            {
              text: 'getTxpoolContent',
              link: '/docs/actions/test/getTxpoolContent',
            },
            {
              text: 'getTxpoolStatus',
              link: '/docs/actions/test/getTxpoolStatus',
            },
            {
              text: 'inspectTxpool',
              link: '/docs/actions/test/inspectTxpool',
            },
            {
              text: 'sendUnsignedTransaction',
              link: '/docs/actions/test/sendUnsignedTransaction',
            },
          ],
        },
      ],
    },
    {
      text: 'Accounts',
      collapsed: true,
      items: [
        { text: 'JSON-RPC', link: '/docs/accounts/jsonRpc' },
        {
          text: 'Local',
          link: '/docs/accounts/local',
          items: [
            { text: 'Private Key', link: '/docs/accounts/privateKey' },
            { text: 'Mnemonic', link: '/docs/accounts/mnemonic' },
            {
              text: 'Hierarchical Deterministic (HD)',
              link: '/docs/accounts/hd',
            },
            { text: 'Custom', link: '/docs/accounts/custom' },
            { text: 'signMessage', link: '/docs/accounts/signMessage' },
            { text: 'signTransaction', link: '/docs/accounts/signTransaction' },
            { text: 'signTypedData', link: '/docs/accounts/signTypedData' },
          ],
        },
      ],
    },
    {
      text: 'Contract',
      collapsed: true,
      items: [
        {
          text: 'Contract Instances',
          link: '/docs/contract/getContract',
        },
        {
          text: 'Actions',
          items: [
            {
              text: 'createContractEventFilter',
              link: '/docs/contract/createContractEventFilter',
            },
            {
              text: 'deployContract',
              link: '/docs/contract/deployContract',
            },
            {
              text: 'estimateContractGas',
              link: '/docs/contract/estimateContractGas',
            },
            {
              text: 'getBytecode',
              link: '/docs/contract/getBytecode',
            },
            {
              text: 'getContractEvents',
              link: '/docs/contract/getContractEvents',
            },
            {
              text: 'getStorageAt',
              link: '/docs/contract/getStorageAt',
            },
            {
              text: 'multicall',
              link: '/docs/contract/multicall',
            },
            {
              text: 'readContract',
              link: '/docs/contract/readContract',
            },
            {
              text: 'simulateContract',
              link: '/docs/contract/simulateContract',
            },
            {
              text: 'writeContract',
              link: '/docs/contract/writeContract',
            },
            {
              text: 'watchContractEvent',
              link: '/docs/contract/watchContractEvent',
            },
          ],
        },
        {
          text: 'Encoding',
          items: [
            {
              text: 'decodeDeployData',
              link: '/docs/contract/decodeDeployData',
            },
            {
              text: 'decodeErrorResult',
              link: '/docs/contract/decodeErrorResult',
            },
            {
              text: 'decodeEventLog',
              link: '/docs/contract/decodeEventLog',
            },
            {
              text: 'decodeFunctionData',
              link: '/docs/contract/decodeFunctionData',
            },
            {
              text: 'decodeFunctionResult',
              link: '/docs/contract/decodeFunctionResult',
            },
            {
              text: 'encodeDeployData',
              link: '/docs/contract/encodeDeployData',
            },
            {
              text: 'encodeErrorResult',
              link: '/docs/contract/encodeErrorResult',
            },
            {
              text: 'encodeEventTopics',
              link: '/docs/contract/encodeEventTopics',
            },
            {
              text: 'encodeFunctionData',
              link: '/docs/contract/encodeFunctionData',
            },
            {
              text: 'encodeFunctionResult',
              link: '/docs/contract/encodeFunctionResult',
            },
          ],
        },
      ],
    },
    {
      text: 'ENS',
      collapsed: true,
      items: [
        {
          text: 'Actions',
          items: [
            {
              text: 'getEnsAddress',
              link: '/docs/ens/actions/getEnsAddress',
            },
            {
              text: 'getEnsAvatar',
              link: '/docs/ens/actions/getEnsAvatar',
            },
            { text: 'getEnsName', link: '/docs/ens/actions/getEnsName' },
            {
              text: 'getEnsResolver',
              link: '/docs/ens/actions/getEnsResolver',
            },
            {
              text: 'getEnsText',
              link: '/docs/ens/actions/getEnsText',
            },
          ],
        },
        {
          text: 'Utilities',
          items: [
            { text: 'labelhash', link: '/docs/ens/utilities/labelhash' },
            { text: 'namehash', link: '/docs/ens/utilities/namehash' },

            { text: 'normalize', link: '/docs/ens/utilities/normalize' },
          ],
        },
      ],
    },
    {
      text: 'ABI',
      collapsed: true,
      items: [
        {
          text: 'decodeAbiParameters',
          link: '/docs/abi/decodeAbiParameters',
        },
        {
          text: 'encodeAbiParameters',
          link: '/docs/abi/encodeAbiParameters',
        },
        {
          text: 'encodePacked',
          link: '/docs/abi/encodePacked',
        },
        {
          text: 'getAbiItem',
          link: '/docs/abi/getAbiItem',
        },
        {
          text: 'parseAbi',
          link: '/docs/abi/parseAbi',
        },
        {
          text: 'parseAbiItem',
          link: '/docs/abi/parseAbiItem',
        },
        {
          text: 'parseAbiParameter',
          link: '/docs/abi/parseAbiParameter',
        },
        {
          text: 'parseAbiParameters',
          link: '/docs/abi/parseAbiParameters',
        },
      ],
    },
    {
      text: 'Utilities',
      collapsed: true,
      items: [
        {
          text: 'Addresses',
          items: [
            {
              text: 'getAddress',
              link: '/docs/utilities/getAddress',
            },
            {
              text: 'getContractAddress',
              link: '/docs/utilities/getContractAddress',
            },
            {
              text: 'isAddress',
              link: '/docs/utilities/isAddress',
            },
            {
              text: 'isAddressEqual',
              link: '/docs/utilities/isAddressEqual',
            },
          ],
        },
        {
          text: 'Data',
          items: [
            {
              text: 'concat',
              link: '/docs/utilities/concat',
            },
            {
              text: 'isBytes',
              link: '/docs/utilities/isBytes',
            },
            {
              text: 'isHex',
              link: '/docs/utilities/isHex',
            },
            {
              text: 'pad',
              link: '/docs/utilities/pad',
            },
            {
              text: 'slice',
              link: '/docs/utilities/slice',
            },
            {
              text: 'size',
              link: '/docs/utilities/size',
            },
            {
              text: 'trim',
              link: '/docs/utilities/trim',
            },
          ],
        },
        {
          text: 'Encoding',
          items: [
            {
              text: 'fromBytes',
              link: '/docs/utilities/fromBytes',
            },
            {
              text: 'fromHex',
              link: '/docs/utilities/fromHex',
            },
            {
              text: 'fromRlp',
              link: '/docs/utilities/fromRlp',
            },
            {
              text: 'toBytes',
              link: '/docs/utilities/toBytes',
            },
            {
              text: 'toHex',
              link: '/docs/utilities/toHex',
            },
            {
              text: 'toRlp',
              link: '/docs/utilities/toRlp',
            },
          ],
        },
        {
          text: 'Hash',
          items: [
            {
              text: 'getEventSelector',
              link: '/docs/utilities/getEventSelector',
            },
            {
              text: 'getEventSignature',
              link: '/docs/utilities/getEventSignature',
            },
            {
              text: 'getFunctionSelector',
              link: '/docs/utilities/getFunctionSelector',
            },
            {
              text: 'getFunctionSignature',
              link: '/docs/utilities/getFunctionSignature',
            },
            {
              text: 'keccak256',
              link: '/docs/utilities/keccak256',
            },
          ],
        },
        {
          text: 'Signature',
          items: [
            {
              text: 'hashMessage',
              link: '/docs/utilities/hashMessage',
            },
            {
              text: 'hashTypedData',
              link: '/docs/utilities/hashTypedData',
            },
            {
              text: 'hexToSignature',
              link: '/docs/utilities/hexToSignature',
            },
            {
              text: 'recoverAddress',
              link: '/docs/utilities/recoverAddress',
            },
            {
              text: 'recoverMessageAddress',
              link: '/docs/utilities/recoverMessageAddress',
            },
            {
              text: 'recoverPublicKey',
              link: '/docs/utilities/recoverPublicKey',
            },
            {
              text: 'recoverTypedDataAddress',
              link: '/docs/utilities/recoverTypedDataAddress',
            },
            {
              text: 'signatureToHex',
              link: '/docs/utilities/signatureToHex',
            },
            {
              text: 'verifyMessage',
              link: '/docs/utilities/verifyMessage',
            },
            {
              text: 'verifyTypedData',
              link: '/docs/utilities/verifyTypedData',
            },
          ],
        },
        {
          text: 'Transaction',
          items: [
            {
              text: 'parseTransaction',
              link: '/docs/utilities/parseTransaction',
            },
            {
              text: 'serializeTransaction',
              link: '/docs/utilities/serializeTransaction',
            },
          ],
        },
        {
          text: 'Units',
          items: [
            {
              text: 'formatEther',
              link: '/docs/utilities/formatEther',
            },
            {
              text: 'formatGwei',
              link: '/docs/utilities/formatGwei',
            },
            {
              text: 'formatUnits',
              link: '/docs/utilities/formatUnits',
            },
            {
              text: 'parseEther',
              link: '/docs/utilities/parseEther',
            },
            {
              text: 'parseGwei',
              link: '/docs/utilities/parseGwei',
            },
            {
              text: 'parseUnits',
              link: '/docs/utilities/parseUnits',
            },
          ],
        },
      ],
    },
    {
      text: 'Third Party',
      collapsed: true,
      items: [
        {
          text: 'Account Abstraction',
          link: '/docs/third-party/account-abstraction',
        },
      ],
    },
    {
      text: 'Glossary',
      collapsed: true,
      items: [
        { text: 'Terms', link: '/docs/glossary/terms' },
        { text: 'Types', link: '/docs/glossary/types' },
        { text: 'Errors', link: '/docs/glossary/errors' },
      ],
    },
  ],
}
