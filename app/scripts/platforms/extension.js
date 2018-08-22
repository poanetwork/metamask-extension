const extension = require('extensionizer')
const explorerLinks = require('eth-net-props').explorerLinks

class ExtensionPlatform {

  //
  // Public
  //
  reload () {
    extension.runtime.reload()
  }

  openWindow ({ url }) {
    extension.tabs.create({ url })
  }

  closeCurrentWindow () {
    return extension.windows.getCurrent((windowDetails) => {
      return extension.windows.remove(windowDetails.id)
    })
  }

  getVersion () {
    return extension.runtime.getManifest().version
  }

  openExtensionInBrowser (route = null) {
    let extensionURL = extension.runtime.getURL('home.html')
    if (route) {
      extensionURL += `#${route}`
    }
    this.openWindow({ url: extensionURL })
  }

  getPlatformInfo (cb) {
    try {
      extension.runtime.getPlatformInfo((platform) => {
        cb(null, platform)
      })
    } catch (e) {
      cb(e)
    }
  }

  showTransactionNotification (txMeta) {

    const status = txMeta.status
    if (status === 'confirmed') {
      this._showConfirmedTransaction(txMeta)
    } else if (status === 'failed') {
      this._showFailedTransaction(txMeta)
    }
  }

  _showConfirmedTransaction (txMeta) {

    this._subscribeToNotificationClicked()

    const { url, explorerName } = this._getExplorer(txMeta.hash, parseInt(txMeta.metamaskNetworkId))
    const nonce = parseInt(txMeta.txParams.nonce, 16)

    const title = 'Confirmed transaction'
    const message = `Transaction ${nonce} confirmed! View on ${explorerName}`
    this._showNotification(title, message, url)
  }

  _showFailedTransaction (txMeta) {

    const nonce = parseInt(txMeta.txParams.nonce, 16)
    const title = 'Failed transaction'
    const message = `Transaction ${nonce} failed! ${txMeta.err.message}`
    this._showNotification(title, message)
  }

  _showNotification (title, message, url) {
    extension.notifications.create(
      url,
      {
      'type': 'basic',
      'title': title,
      'iconUrl': extension.extension.getURL('../../images/icon-64.png'),
      'message': message,
      })
  }

  _subscribeToNotificationClicked () {
    if (!extension.notifications.onClicked.hasListener(this._viewOnEtherScan)) {
      extension.notifications.onClicked.addListener(this._viewOnEtherScan)
    }
  }

  _viewOnEtherScan (txId) {
    if (txId.startsWith('http://') || txId.startsWith('https://')) {
      global.metamaskController.platform.openWindow({ url: txId })
    }
  }

  _getExplorer (hash, networkId) {
    let explorerName
    if (networkId === 99 || networkId === 77) {
      explorerName = 'POA explorer'
    } else {
      explorerName = 'Etherscan'
    }

    return {
      explorerName: explorerName,
      url: explorerLinks.getExplorerTxLinkFor(hash, networkId),
    }
  }

}

module.exports = ExtensionPlatform
