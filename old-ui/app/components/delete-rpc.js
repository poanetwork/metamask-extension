import ConfirmScreen from './confirm'
import React from 'react'
import { connect } from 'react-redux'
import actions from '../../../ui/app/actions'

class DeleteRpc extends ConfirmScreen {
  render () {
    return (
      <ConfirmScreen
        subtitle="Delete Custom RPC"
        question={`Are you sure you want to delete ${this.props.url} ?`}
        onCancelClick={() => this.props.showConfigPage()}
        onNoClick={() => this.props.showConfigPage()}
        onYesClick={() => {
          this.props.removeCustomRPC(this.props.url, this.props.provider)
            .then(() => {
              this.props.showConfigPage()
            })
        }}
      />
    )
  }
}

const mapStateToProps = (state) => {
  return {
    url: state.appState.RPC_URL ? state.appState.RPC_URL : state.metamask.provider.rpcTarget,
    provider: state.metamask.provider,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    removeCustomRPC: (url, provider) => dispatch(actions.removeCustomRPC(url, provider)),
    showConfigPage: () => dispatch(actions.showConfigPage()),
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(DeleteRpc)
