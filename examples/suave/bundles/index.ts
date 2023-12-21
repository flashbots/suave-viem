import {
  Address,
  Hex,
  encodeAbiParameters,
  encodeFunctionData,
  toHex,
} from 'viem'
import { suaveRigil } from 'viem/chains'
import { SuaveTxTypes, TransactionRequestSuave } from '../../../src/chains/suave/types'
import MevShareContract from '../contracts/out/bids.sol/MevShareContract.json'

export interface MevShareRecord {
  allowedPeekers: Address[]
  allowedStores: Address[]
  blockNumber: bigint
  signedTx: Hex
  mevShareContract: Address
  kettle: Address
  chainId: number
}

/** Helper class to create MEV-Share data records on SUAVE. */
export class MevShareRecord {
  constructor(
    blockNumber: bigint,
    signedTx: Hex,
    kettle: Address,
    mevShareContract: Address,
    chainId: number,
  ) {
    this.blockNumber = blockNumber
    this.signedTx = signedTx
    this.kettle = kettle
    this.mevShareContract = mevShareContract
    this.chainId = chainId
    this.allowedPeekers = [
      // no idea what I'm doing here
      suaveRigil.contracts.ANYALLOWED.address,
    ]
    this.allowedStores = []
  }

  /** Encodes calldata to call the `newTransaction` function. */
  private newCalldata() {
    return encodeFunctionData({
      abi: MevShareContract.abi,
      functionName: 'newBid',
      args: [this.blockNumber, this.allowedPeekers, this.allowedStores],
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
      to: this.mevShareContract,
      data: this.newCalldata(),
      type: '0x43',
      gas: 500000n,
      gasPrice: 1000000000n,
      chainId: this.chainId,
      kettleAddress: this.kettle,
      confidentialInputs: this.confidentialInputsBytes(),
    }
  }
}
