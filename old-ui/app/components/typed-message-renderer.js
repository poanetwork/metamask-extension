import React, { Component } from 'react'
import PropTypes from 'prop-types'
const extend = require('xtend')
import classnames from 'classnames'

class TypedMessageRenderer extends Component {
  static propTypes = {
    value: PropTypes.object,
    version: PropTypes.string,
    style: PropTypes.object,
  }

  renderTypedData (values) {
    return values.map(function (value, ind) {
      let v = value.value
      if (typeof v === 'boolean') {
        v = v.toString()
      }
      return (
        <div key={ind}>
          <strong style={{display: 'block', fontWeight: 'bold'}}>{String(value.name) + ':'}</strong>
          <div>{v}</div>
        </div
        >)
    })
  }

  renderTypedDataV3V4 (values) {
    const { message } = JSON.parse(values)
     return [
      message ? <div>
          <h1>Message</h1>
          {this.renderNode(message)}
        </div> : '',
    ]
  }

  renderNode (data) {
    return (
      <div className="signature-request-message--node">
        {Object.entries(data).map(([label, value], i) => (
          <div
            className={classnames('signature-request-message--node', {
              'signature-request-message--node-leaf':
                typeof value !== 'object' || value === null,
            })}
            key={i}
          >
            <span className="signature-request-message--node-label">
              {label}:{' '}
            </span>
            {typeof value === 'object' && value !== null ? (
              this.renderNode(value)
            ) : (
              <span className="signature-request-message--node-value">
                {value}
              </span>
            )}
          </div>
        ))}
      </div>
    )
  }

  render () {
    const props = this.props
    const { value, version, style } = props
    let text
    switch (version) {
      case 'V1':
        text = this.renderTypedData(value)
        break
      case 'V3':
      case 'V4':
        text = this.renderTypedDataV3V4(value)
        break
    }

    const defaultStyle = extend({
      width: '100%',
      maxHeight: '210px',
      resize: 'none',
      border: 'none',
      background: '#542289',
      color: 'white',
      padding: '20px',
      overflow: 'auto',
    }, style)

    return (
      <div className="font-small" style={defaultStyle}>
        {text}
      </div>
    )
  }
}

module.exports = TypedMessageRenderer
