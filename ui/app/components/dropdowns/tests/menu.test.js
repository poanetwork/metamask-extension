import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { shallow } from 'enzyme'
import { Menu, Item, Divider, CloseArea } from '../components/menu'

describe('Dropdown Menu Components', function () {

  describe('Menu', function () {
    let wrapper

    it('adds prop className to menu', function () {
      wrapper = shallow(
        <Menu className="Test Class" isShowing />,
      )
      assert.equal(wrapper.find('.menu').prop('className'), 'menu Test Class')
    })

  })

  describe('Item', function () {
    let wrapper

    const onClickSpy = sinon.spy()

    beforeEach(function () {
      wrapper = shallow(
        <Item
          icon="test icon"
          text="test text"
          className="test className"
          onClick={onClickSpy}
        />,
      )
    })

    it('add className based on props', function () {
      assert.equal(wrapper.find('.menu__item').prop('className'), 'menu__item menu__item test className menu__item--clickable')
    })

    it('simulates onClick called', function () {
      wrapper.find('.menu__item').prop('onClick')()
      assert.equal(onClickSpy.callCount, 1)
    })

    it('adds icon based on icon props', function () {
      assert.equal(wrapper.find('.menu__item__icon').text(), 'test icon')
    })

    it('adds html text based on text props', function () {
      assert.equal(wrapper.find('.menu__item__text').text(), 'test text')
    })
  })

  describe('Divider', function () {
    let wrapper

    it('renders menu divider', function () {
      wrapper = shallow(<Divider />)
      assert.equal(wrapper.find('.menu__divider').length, 1)
    })
  })

  describe('CloseArea', function () {
    let wrapper

    const onClickSpy = sinon.spy()

    it('simulates click', function () {
      wrapper = shallow(<CloseArea onClick={onClickSpy} />)
      wrapper.prop('onClick')()
      assert.equal(onClickSpy.callCount, 1)
    })
  })

})
