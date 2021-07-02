
/**
 * @typedef {Object} FirstTimeState
 * @property {Object} config Initial configuration parameters
 * @property {Object} NetworkController Network controller state
 */

/**
 * @type {FirstTimeState}
 */
const initialState = {
  config: {},
    NetworkController: {
      provider: {
        type: 'rpc',
        rpcTarget: 'http://localhost:8545',
        chainId: '0x539',
      },
    },
}

module.exports = initialState
