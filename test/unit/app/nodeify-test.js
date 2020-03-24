const assert = require('assert')
const nodeify = require('../../../app/scripts/lib/nodeify')

describe('nodeify', function () {
  const obj = {
    foo: 'bar',
    promiseFunc: function (a) {
      const solution = this.foo + a
      return Promise.resolve(solution)
    },
  }

  it('should retain original context', function (done) {
    const nodified = nodeify(obj.promiseFunc, obj)
    nodified('baz', function (err, res) {
      if (!err) {
        assert.equal(res, 'barbaz')
        done()
      } else {
        done(new Error(err.toString()))
      }
    })
  })

  it('should allow the last argument to not be a function', function (done) {
    const nodified = nodeify(obj.promiseFunc, obj)
    try {
      nodified('baz')
      done()
    } catch (err) {
      done(new Error('should not have thrown if the last argument is not a function'))
    }
  })
})
