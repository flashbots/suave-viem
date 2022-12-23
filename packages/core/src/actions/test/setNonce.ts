import type { TestClient } from '../../clients'
import type { Address } from '../../types'
import { numberToHex } from '../../utils'

export type SetNonceArgs = {
  /** The account address. */
  address: Address
  /** The nonce to set. */
  nonce: number
}

export async function setNonce(
  client: TestClient,
  { address, nonce }: SetNonceArgs,
) {
  return await client.request({
    method: `${client.mode}_setNonce`,
    params: [address, numberToHex(nonce)],
  })
}