import { Address, Hex, encodeAbiParameters, encodeFunctionData, toHex } from 'viem'
import precompiles from 'viem/chains/suave/precompiles'
import { SuaveTxTypes, TransactionRequestSuave } from 'viem/chains/suave/types'
import MevShareBidContract from '../contracts/out/bids.sol/MevShareBidContract.json'

export interface MevShareBid {
    allowedPeekers: Address[]
    allowedStores: Address[]
    blockNumber: bigint
    signedTx: Hex
    mevShareContract: Address
    kettle: Address
    chainId: number
}

/** Helper class to create MEV-Share bids on SUAVE. */
export class MevShareBid {
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
            precompiles.ANYALLOWED,
        ]
        this.allowedStores = []
    }

    /** Encodes calldata to call the `newBid` function. */
    private newBidCalldata() {
        return encodeFunctionData({
            abi: MevShareBidContract.abi,
            functionName: 'newBid',
            args: [
                this.blockNumber,
                this.allowedPeekers,
                this.allowedStores,
            ],
        })
    }

    /** Wraps `signedTx` in a bundle, then ABI-encodes it as bytes for `confidentialInputs`. */
    private confidentialInputsBytes(): Hex {
        const bundleBytes = toHex(JSON.stringify({
            txs: [this.signedTx],
            revertingHashes: [],
        }))
        return encodeAbiParameters([{type: 'bytes'}], [bundleBytes])
    }

    /** Encodes this bid as a ConfidentialComputeRequest, which can be sent to SUAVE. */
    toConfidentialRequest(): TransactionRequestSuave {
        return {
            to: this.mevShareContract,
            data: this.newBidCalldata(),
            type: SuaveTxTypes.ConfidentialRequest,
            gas: 500000n,
            gasPrice: 1000000000n,
            chainId: this.chainId,
            kettleAddress: this.kettle,
            confidentialInputs: this.confidentialInputsBytes(),
        }
    }
}
