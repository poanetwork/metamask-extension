import React from 'react'
import assert from 'assert'
import ErrorComponent from '../../../../../old-ui/app/components/error'
import { mount } from 'enzyme'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import { Provider } from 'react-redux'

const state = {
  metamask: {},
  appState: {},
}

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const store = mockStore(state)
let wrapper

describe('ErrorComponent', function () {
  describe('renders ErrorComponent', function () {
    it('shows error', function () {
      wrapper = mount(
        <Provider store={store}>
          <ErrorComponent error="Error!" />
        </Provider>,
      )
      assert.equal(wrapper.find('.error').text(), 'Error!')
    })
  })

  describe('doesn\'t render ErrorComponent component', function () {
    it('doesn\'t show error', function () {
      wrapper = mount(
        <Provider store={store}>
          <ErrorComponent />
        </Provider>,
      )
      assert.equal(wrapper.find('.error').isEmpty(), true)
    })
  })
})
