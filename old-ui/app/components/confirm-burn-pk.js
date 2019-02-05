import ConfirmScreen from './confirm'
import React from 'react'
import { connect } from 'react-redux'
import actions from '../../../ui/app/actions'
import generator from 'generate-password'

class BurnPKScreen extends ConfirmScreen {
  render () {
    return (
      <ConfirmScreen
        subtitle="Burn Private Keys"
        question={`Are you sure you want to burn seed phrase?`}
        onCancelClick={() => this.props.goHome()}
        onNoClick={() => this.props.goHome()}
        onYesClick={() => {
          const pass = generator.generate({
              length: 10,
              numbers: true,
          })
          this.props.setKeyringPass(pass)
          this.props.createNewVaultAndKeychain(pass, true)
            .then(() => {
              this.props.actions.goHome()
            })
        }}
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goHome: () => dispatch(actions.goHome()),
    createNewVaultAndKeychain: (pass, force) => dispatch(actions.createNewVaultAndKeychain(pass, force)),
    setKeyringPass: pass => dispatch(actions.setKeyringPass(pass)),
  }
}

module.exports = connect(null, mapDispatchToProps)(BurnPKScreen)
