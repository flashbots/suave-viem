import { Address, Hex, PublicClient, Transport, encodeAbiParameters, encodeFunctionData, keccak256, parseAbi } from 'viem'
import { suaveRigil } from 'viem/chains'
import { SuaveTxTypes, TransactionRequestSuave } from 'viem/chains/suave/types'

export interface ILimitOrder {
    tokenIn: Address
    tokenOut: Address
    amountInMax: bigint
    amountOutMin: bigint
    expiryTimestamp: bigint
    senderKey: Hex
}

type SuaveClient<T extends Transport> = PublicClient<T, typeof suaveRigil>;

export class LimitOrder<T extends Transport> implements ILimitOrder {
    // ILimitOrder fields
    tokenIn: Address
    tokenOut: Address
    amountInMax: bigint
    amountOutMin: bigint
    expiryTimestamp: bigint
    senderKey: Hex
    // client configs
    client: SuaveClient<T>
    contractAddress: Address
    kettleAddress: Address

    constructor(params: ILimitOrder, client: SuaveClient<T>, contractAddress: Address, kettleAddress: Address) {
        this.tokenIn = params.tokenIn
        this.tokenOut = params.tokenOut
        this.amountInMax = params.amountInMax
        this.amountOutMin = params.amountOutMin
        this.expiryTimestamp = params.expiryTimestamp
        this.senderKey = params.senderKey
        this.client = client
        this.contractAddress = contractAddress
        this.kettleAddress = kettleAddress
    }

    inner(): ILimitOrder {
        return {
            tokenIn: this.tokenIn,
            tokenOut: this.tokenOut,
            amountInMax: this.amountInMax,
            amountOutMin: this.amountOutMin,
            expiryTimestamp: this.expiryTimestamp,
            senderKey: this.senderKey,
        }
    }

    hashkey(): Hex {
        return keccak256(this.publicBytes())
    }

    // TODO: ideally we'd extend PublicClient to create LimitOrders, then we could
    // just use the class' client instance
    async toTransactionRequest(): Promise<TransactionRequestSuave> {
        const feeData = await this.client.getFeeHistory({blockCount: 1, rewardPercentiles: [51]})
        return {
            to: this.contractAddress,
            data: this.newOrderCalldata(),
            confidentialInputs: this.confidentialInputsBytes(),
            kettleAddress: this.kettleAddress,
            gasPrice: feeData.baseFeePerGas[0],
            gas: 150000n,
            type: SuaveTxTypes.ConfidentialRequest,
        }
    }

    private confidentialInputsBytes(): Hex {
        return encodeAbiParameters([
            {type: 'address', name: 'token_in'},
            {type: 'address', name: 'token_out'},
            {type: 'uint256', name: 'amount_in_max'},
            {type: 'uint256', name: 'amount_out_min'},
            {type: 'uint256', name: 'expiry_timestamp'},
            {type: 'bytes32', name: 'sender_key'}
        ], [
            this.tokenIn,
            this.tokenOut,
            this.amountInMax,
            this.amountOutMin,
            this.expiryTimestamp,
            this.senderKey,
        ])
    }


    private publicBytes(): Hex {
        return encodeAbiParameters([
            {type: 'address', name: 'token_in'},
            {type: 'address', name: 'token_out'},
            {type: 'uint256', name: 'amount_in_max'},
            {type: 'uint256', name: 'amount_out_min'},
            {type: 'uint256', name: 'expiry_timestamp'},
        ], [
            this.tokenIn,
            this.tokenOut,
            this.amountInMax,
            this.amountOutMin,
            this.expiryTimestamp,
        ])
    }

    private newOrderCalldata(): Hex {
        return encodeFunctionData({
            abi: parseAbi(['function sendIntent() public']),
            // args: [],
            functionName: 'sendIntent'
          })
    }
}