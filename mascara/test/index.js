const fs = require('fs')
const path = require('path')
const browserify = require('browserify')

const tests = fs.readdirSync(path.join(__dirname, 'lib'))
const bundlePath = path.join(__dirname, 'test-bundle.js')
const b = browserify()

// Remove old bundle
try {
  fs.unlinkSync(bundlePath)
} catch (e) {
  console.error(e)
}

const writeStream = fs.createWriteStream(bundlePath)

tests.forEach(function (fileName) {
  b.add(path.join(__dirname, 'lib', fileName))
})

b.bundle().pipe(writeStream)

