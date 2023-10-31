import { expect, test, vi } from 'vitest'

import { wagmiContractConfig } from '../../test/src/abis.js'
import { anvilChain, publicClient } from '../../test/src/utils.js'
import * as getChainId from '../actions/public/getChainId.js'
import { readContract } from '../actions/public/readContract.js'
import { createClient } from '../clients/createClient.js'
import { http } from '../clients/transports/http.js'
import { getAction } from './getAction.js'

test('uses tree-shakable action', async () => {
  const client = createClient({ chain: anvilChain, transport: http() })
  const actionSpy = vi.spyOn(getChainId, 'getChainId')
  await getAction(client, getChainId.getChainId)({})
  expect(actionSpy).toBeCalledWith(client, {})
})

test('uses client action', async () => {
  const client = createClient({ chain: anvilChain, transport: http() }).extend(
    () => ({
      async getChainId() {
        return 69
      },
    }),
  )
  const clientSpy = vi.spyOn(client, 'getChainId')
  await getAction(client, getChainId.getChainId)({})
  expect(clientSpy).toBeCalledWith({})
})

test('e2e', async () => {
  const client = publicClient.extend(() => ({
    async call() {
      return {
        data: '0x0000000000000000000000000000000000000000000000000000000000000045',
      }
    },
  }))
  expect(
    await readContract(client, {
      ...wagmiContractConfig,
      functionName: 'balanceOf',
      args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'],
    }),
  ).toEqual(69n)
})
