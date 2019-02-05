import React from 'react'
import PersistentForm from '../../../lib/persistent-form'
import { connect } from 'react-redux'
import actions from '../../../../ui/app/actions'
import {
  numericBalance,
  isHex,
  normalizeEthStringToWei,
  isInvalidChecksumAddress,
  isValidAddress,
} from '../../util'
import EnsInput from '../ens-input'
import ethUtil from 'ethereumjs-util'
import SendProfile from './send-profile'
import SendHeader from './send-header'
import ErrorComponent from '../error'
import { getMetaMaskAccounts } from '../../../../ui/app/selectors'
import ToastComponent from '../toast'

class SendTransactionScreen extends PersistentForm {
  constructor (props) {
    super(props)
    this.state = {
      amount: '',
      txData: '',
    }
  }

  render () {
    const { amount, txData } = this.state
    this.persistentFormParentId = 'send-tx-form'

    const props = this.props
    const {
      network,
      identities,
      addressBook,
      error,
    } = props

    return (

      <div className="send-screen flex-column flex-grow">
        <ToastComponent isSuccess={false} />
        <SendProfile/>
        <SendHeader title={'Send Transaction'} />
        <ErrorComponent error={error} />
        <section className="flex-row flex-center">
          <EnsInput
            name="address"
            placeholder="Recipient Address"
            onChange={() => this.recipientDidChange.bind(this)}
            network={network}
            identities={identities}
            addressBook={addressBook}
          />
        </section>

        <section className="flex-row flex-center">
          <input className="large-input"
            name="amount"
            value={amount}
            onChange={(e) => this.amountDidChange(e.target.value)}
            placeholder="Amount"
            type="number"
            style={{
              marginRight: '6px',
            }}
            dataset={{ persistentFormId: 'tx-amount' }}
          />
          <button
            onClick={() => this.onSubmit()}
          >Next
          </button>
        </section>
        <h3 className="flex-center"
          style={{
            background: '#ffffff',
            color: '#333333',
            marginTop: '16px',
            marginBottom: '16px',
          }}
        >Transaction Data (optional)</h3>

        <section className="flex-column flex-center">
          <input className="large-input"
            name="txData"
            value={txData}
            onChange={(e) => this.dataDidChange(e.target.value)}
            placeholder="0x01234"
            style={{
              width: '100%',
              resize: 'none',
            }}
            dataset={{ persistentFormId: 'tx-data' }}
          />
        </section>

      </div>
    )
  }

  componentWillUnmount () {
    this.props.dispatch(actions.displayWarning())
  }

  navigateToAccounts (event) {
    event.stopPropagation()
    this.props.dispatch(actions.showAccountsPage())
  }

  recipientDidChange (recipient, nickname) {
    this.setState({
      recipient,
      nickname,
    })
  }

  amountDidChange (amount) {
    this.setState({
      amount,
    })
  }

  dataDidChange (txData) {
    this.setState({
      txData,
    })
  }

  onSubmit () {
    const state = this.state || {}
    const { amount, txData } = state
    const recipient = state.recipient || document.querySelector('input[name="address"]').value.replace(/^[.\s]+|[.\s]+$/g, '')
    const nickname = state.nickname || ' '
    const parts = amount.split('.')

    let message

    if (isNaN(amount) || amount === '') {
      message = 'Invalid ether value.'
      return this.props.dispatch(actions.displayWarning(message))
    }

    if (parts[1]) {
      const decimal = parts[1]
      if (decimal.length > 18) {
        message = 'Ether amount is too precise.'
        return this.props.dispatch(actions.displayWarning(message))
      }
    }

    const value = normalizeEthStringToWei(amount)
    const balance = this.props.balance

    if (value.gt(balance)) {
      message = 'Insufficient funds.'
      return this.props.dispatch(actions.displayWarning(message))
    }

    if (amount < 0) {
      message = 'Can not send negative amounts of ETH.'
      return this.props.dispatch(actions.displayWarning(message))
    }

    if ((isInvalidChecksumAddress(recipient))) {
      message = 'Recipient address checksum is invalid.'
      return this.props.dispatch(actions.displayWarning(message))
    }

    if ((!isValidAddress(recipient) && !txData) || (!recipient && !txData)) {
      message = 'Recipient address is invalid.'
      return this.props.dispatch(actions.displayWarning(message))
    }

    if (!isHex(ethUtil.stripHexPrefix(txData)) && txData) {
      message = 'Transaction data must be hex string.'
      return this.props.dispatch(actions.displayWarning(message))
    }

    this.props.dispatch(actions.hideWarning())

    this.props.dispatch(actions.addToAddressBook(recipient, nickname))

    const txParams = {
      from: this.props.address,
      value: '0x' + value.toString(16),
    }

    if (recipient) txParams.to = ethUtil.addHexPrefix(recipient)
    if (txData) txParams.data = txData

    this.props.dispatch(actions.signTx(txParams))
  }

}

const mapStateToProps = (state) => {
  const accounts = getMetaMaskAccounts(state)
  const result = {
    address: state.metamask.selectedAddress,
    accounts,
    identities: state.metamask.identities,
    warning: state.appState.warning,
    network: state.metamask.network,
    addressBook: state.metamask.addressBook,
  }

  result.error = result.warning && result.warning.split('.')[0]
  result.account = result.accounts[result.address]
  result.balance = result.account ? numericBalance(result.account.balance) : null

  return result
}

module.exports = connect(mapStateToProps)(SendTransactionScreen)
