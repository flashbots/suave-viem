import { Hex, decodeErrorResult, getFunctionSelector } from 'viem'
import SuaveContract from '../contracts/out/Suave.sol/Suave.json'

function decodeRawError<E extends Error>(error: E): {abiItem: any, args: any, name: string, details: string} {
    const details = error.message.match(/Details: (.*)/)?.[1]
    if (!details) {
      throw new Error('could not find revert details')
    }
    const reason = error.message.match(/execution reverted: (.*)/)?.[1]
    if (!reason) {
      throw new Error('could not find revert reason')
    }
    // check if it's a suave error
    const suaveErrorSelector = getFunctionSelector('PeekerReverted(address, bytes)')
    if (!reason.startsWith(suaveErrorSelector)) {
      console.error("unknown signature, failed to decode revert message", reason)
      throw error
    }
    const decodedReason = decodeErrorResult({abi: SuaveContract.abi, data: reason as Hex})
    return {
        abiItem: decodedReason.abiItem,
        name: decodedReason.errorName,
        args: decodedReason.args,
        details,
    }
}

/// this feels like it should be integrated into viem already, but I
/// think it would rely on me using the contract primitives in viem,
/// which I can't use because of how we sign/send txs (have to use suave wallet directly)
export class SuaveRevert<E extends Error> extends Error {
    abiItem: any
    details: string

    constructor(rawError: E) {
        const decodedError = decodeRawError(rawError)
        super(`args: [${decodedError.args}]`)
        this.name = decodedError.name
        this.abiItem = decodedError.abiItem
        this.cause = rawError.message
        this.details = decodedError.details
    }
}
