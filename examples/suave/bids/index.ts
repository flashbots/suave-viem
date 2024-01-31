import {
  Address,
  Hex,
  encodeAbiParameters,
  encodeFunctionData,
  toHex,
} from 'viem'
import { TransactionRequestSuave } from '../../../src/chains/suave/types'
import OFAContract from '../contracts/out/OFA.sol/OFAPrivate.json'

export interface OFAOrder {
  blockNumber: bigint
  signedTx: Hex
  OFAContract: Address
  kettle: Address
  chainId: number
}

/** Helper class to create MEV-Share bids on SUAVE. */
export class OFAOrder {
  constructor(
    blockNumber: bigint,
    signedTx: Hex,
    kettle: Address,
    OFAContract: Address,
    chainId: number,
  ) {
    this.blockNumber = blockNumber
    this.signedTx = signedTx
    this.kettle = kettle
    this.OFAContract = OFAContract
    this.chainId = chainId
  }

  /** Encodes calldata to call the `newOrder` function. */
  private newOrderCalldata() {
    return encodeFunctionData({
      abi: OFAContract.abi,
      functionName: 'newOrder',
      args: [this.blockNumber],
    })
  }

  /** Wraps `signedTx` in a bundle, then ABI-encodes it as bytes for `confidentialInputs`. */
  private confidentialInputsBytes(): Hex {
    const bundleBytes = toHex(
      JSON.stringify({
        txs: [this.signedTx],
        revertingHashes: [],
      }),
    )
    return encodeAbiParameters([{ type: 'bytes' }], [bundleBytes])
  }

  /** Encodes this bid as a ConfidentialComputeRequest, which can be sent to SUAVE. */
  toConfidentialRequest(): TransactionRequestSuave {
    return {
      to: this.OFAContract,
      data: this.newOrderCalldata(),
      type: '0x43',
      gas: 500000n,
      gasPrice: 1000000000n,
      chainId: this.chainId,
      kettleAddress: this.kettle,
      confidentialInputs: this.confidentialInputsBytes(),
    }
  }
}
