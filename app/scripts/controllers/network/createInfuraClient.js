const mergeMiddleware = require('json-rpc-engine/src/mergeMiddleware')
const createBlockReRefMiddleware = require('eth-json-rpc-middleware/block-ref')
const createRetryOnEmptyMiddleware = require('eth-json-rpc-middleware/retryOnEmpty')
const createBlockCacheMiddleware = require('eth-json-rpc-middleware/block-cache')
const createInflightMiddleware = require('eth-json-rpc-middleware/inflight-cache')
const createBlockTrackerInspectorMiddleware = require('eth-json-rpc-middleware/block-tracker-inspector')
const providerFromMiddleware = require('eth-json-rpc-middleware/providerFromMiddleware')
const createInfuraMiddleware = require('eth-json-rpc-infura')
const createBlockTracker = require('./createBlockTracker')

module.exports = createInfuraClient

function createInfuraClient ({ network, platform }) {
  const infuraMiddleware = createInfuraMiddleware({ network })
  const infuraProvider = providerFromMiddleware(infuraMiddleware)
  const blockTracker = createBlockTracker({ provider: infuraProvider }, platform)

  const networkMiddleware = mergeMiddleware([
    createBlockCacheMiddleware({ blockTracker }),
    createInflightMiddleware(),
    createBlockReRefMiddleware({ blockTracker, provider: infuraProvider }),
    createRetryOnEmptyMiddleware({ blockTracker, provider: infuraProvider }),
    createBlockTrackerInspectorMiddleware({ blockTracker }),
    infuraMiddleware,
  ])
  return { networkMiddleware, blockTracker }
}
