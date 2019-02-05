import ConfirmScreen from './confirm'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import actions from '../../../ui/app/actions'

class DeleteImportedAccount extends ConfirmScreen {
  static propTypes = {
    goHome: PropTypes.func,
  }

  render () {
    const { identity, network } = this.props
    return (
      <ConfirmScreen
        subtitle="Delete Imported Account"
        withDescription={true}
        description="Be sure, that you saved a private key or JSON keystore file of this account in a safe place. Otherwise, you will not be able to restore this account."
        question={`Are you sure you want to delete imported ${identity.name} (${identity.address})?`}
        onCancelClick={() => this.props.goHome()}
        onNoClick={() => this.props.goHome()}
        onYesClick={() => {
          this.props.removeAccount(identity.address, network)
            .then(() => {
              this.props.goHome()
            })
        }}
      />
    )
  }
}

const mapStateToProps = (state) => {
  return {
    network: state.metamask.network,
    identity: state.appState.identity,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    removeAccount: (address, network) => dispatch(actions.removeAccount(address, network)),
    goHome: () => dispatch(actions.goHome()),
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(DeleteImportedAccount)
