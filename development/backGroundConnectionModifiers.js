module.exports = {
  'confirm sig requests': {
    signMessage: (_msgData, cb) => {
      const stateUpdate = {
        unapprovedMsgs: {},
        unapprovedMsgCount: 0,
      }
      return cb(null, stateUpdate)
    },
    signPersonalMessage: (_msgData, cb) => {
      const stateUpdate = {
        unapprovedPersonalMsgs: {},
        unapprovedPersonalMsgCount: 0,
      }
      return cb(null, stateUpdate)
    },
    signTypedMessage: (_msgData, cb) => {
      const stateUpdate = {
        unapprovedTypedMessages: {},
        unapprovedTypedMessagesCount: 0,
      }
      return cb(null, stateUpdate)
    },
  },
}

