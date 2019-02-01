import React, { Component } from 'react'

export default class NiftyLogoComponent extends Component {
	render () {
		return (
			<div className="flex-column flex-center flex-grow">
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
