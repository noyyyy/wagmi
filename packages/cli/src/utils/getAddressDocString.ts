import * as allChains from '@wagmi/chains'
import { capitalCase } from 'change-case'
import dedent from 'dedent'

import type { Contract } from '../config'

const chainMap: Record<allChains.Chain['id'], allChains.Chain> = {}
for (const chain of Object.values(allChains)) {
  if (!('id' in chain)) continue
  chainMap[chain.id] = chain
}

export function getAddressDocString({
  address,
}: {
  address: Contract['address']
}) {
  if (!address || typeof address === 'string') return ''

  if (Object.keys(address).length === 1)
    return `* ${getLink({
      address: address[parseInt(Object.keys(address)[0]!)]!,
      chainId: parseInt(Object.keys(address)[0]!),
    })}`

  const addresses = Object.entries(address).filter(
    (x) => chainMap[parseInt(x[0])],
  )
  if (addresses.length === 0) return ''
  if (addresses.length === 1 && addresses[0])
    return `* ${getLink({
      address: addresses[0][1],
      chainId: parseInt(addresses[0][0])!,
    })}`

  return dedent`
    ${addresses.reduce((prev, curr) => {
      const chainId = parseInt(curr[0])
      const address = curr[1]
      return `${prev}\n* - ${getLink({ address, chainId })}`
    }, '')}
  `
}

function getLink({ address, chainId }: { address: string; chainId: number }) {
  const chain = chainMap[chainId]
  if (!chain) return ''
  const blockExplorer = chain.blockExplorers?.default
  if (!blockExplorer) return ''
  return `[__View Contract on ${capitalCase(chain.name)} ${capitalCase(
    blockExplorer.name,
  )}__](${blockExplorer.url}/address/${address})`
}
