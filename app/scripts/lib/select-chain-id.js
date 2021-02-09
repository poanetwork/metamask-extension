import {
  MAINNET_CHAIN_ID,
  ROPSTEN_CHAIN_ID,
  RINKEBY_CHAIN_ID,
  KOVAN_CHAIN_ID,
  GOERLI_TESTNET_CHAIN_ID,
  POA_CHAIN_ID,
  DAI_CHAIN_ID,
  POA_SOKOL_CHAIN_ID,
  RSK_CHAIN_ID,
  RSK_TESTNET_CHAIN_ID,
  CLASSIC_CHAIN_ID,
  CELO_CHAIN_ID,
  CELO_ALFAJORES_TESTNET_CHAIN_ID,
  CELO_BAKLAVA_TESTNET_CHAIN_ID,
} from '../controllers/network/enums'

const standardNetworkId = {
  '1': MAINNET_CHAIN_ID,
  '3': ROPSTEN_CHAIN_ID,
  '4': RINKEBY_CHAIN_ID,
  '42': KOVAN_CHAIN_ID,
  '5': GOERLI_TESTNET_CHAIN_ID,
  '99': POA_CHAIN_ID,
  '100': DAI_CHAIN_ID,
  '77': POA_SOKOL_CHAIN_ID,
  '30': RSK_CHAIN_ID,
  '31': RSK_TESTNET_CHAIN_ID,
  '61': CLASSIC_CHAIN_ID,
  '42220': CELO_CHAIN_ID,
  '44787': CELO_ALFAJORES_TESTNET_CHAIN_ID,
  '62320': CELO_BAKLAVA_TESTNET_CHAIN_ID,
}

function selectChainId (metamaskState) {
  const { network, provider: { chainId } } = metamaskState
  return standardNetworkId[network] || `0x${parseInt(chainId, 10).toString(16)}`
}

export default selectChainId
