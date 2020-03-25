import React from 'react'
import assert from 'assert'
import SendProfile from '../../../../../../old-ui/app/components/send/send-profile'
import Identicon from '../../../../../../old-ui/app/components/identicon'
import { mount } from 'enzyme'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import { Provider } from 'react-redux'

const state = {
  metamask: {
    selectedAddress: '0x99a22ce737b6a48f44cad6331432ce98693cad07',
    accounts: ['0x99a22ce737b6a48f44cad6331432ce98693cad07'],
    cachedBalances: { '0x99a22ce737b6a48f44cad6331432ce98693cad07': 1 },
    identities: {
      '0x99a22ce737b6a48f44cad6331432ce98693cad07': {
        name: 'Account 1',
        address: '0x99a22ce737b6a48f44cad6331432ce98693cad07',
      },
    },
  },
  appState: {},
}

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const store = mockStore(state)
let wrapper

describe('SendProfile component', function () {
  describe('renders SendProfile component', function () {
    beforeEach(function () {
      wrapper = mount(
        <Provider store={store}>
          <SendProfile />
        </Provider>,
      )
    })
    it('shows identity name', function () {
      assert.equal(wrapper.find('.send-profile-identity-name').text(), 'Account 1')
    })

    it('shows identicon', function () {
      assert.equal(wrapper.find(Identicon).prop('address'), '0x99a22ce737b6a48f44cad6331432ce98693cad07')
      assert.equal(wrapper.find(Identicon).prop('network'), undefined)
    })

    it('shows address', function () {
      assert.equal(wrapper.find('.send-profile-address').text(), '0x99a22cE7...Ad07')
    })

    // todo: add check for Balance
  })
})
