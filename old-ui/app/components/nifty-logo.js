import React, { Component } from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'

export default class NiftyLogoComponent extends Component {
	static propTypes = {
		additionalClasses: PropTypes.array,
	}

	render () {
		const additionalClasses = this.props.additionalClasses ? this.props.additionalClasses.join(' ') : null
		return (
			<div className={classnames(additionalClasses, 'flex-column', 'flex-center', 'flex-grow')}>
						<div className="logo"/>
						<h1 style={{
							paddingTop: '50px',
							fontSize: '30px',
							color: '#ffffff',
						}}>Nifty Wallet</h1>
					</div>
		)
	}
}
