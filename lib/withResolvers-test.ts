import { describe, it } from 'node:test'
import { withResolvers } from './withResolvers'
import assert = require('node:assert')

describe('withResolvers', () => {
  it('resolves an inside out promise', async () => {
    const value = withResolvers<'hi'>()
    value.resolve('hi')
    assert.equal(await value.promise, 'hi')
  })
  it('rejects an inside out promise', async () => {
    const value = withResolvers<string>()
    value.reject(new Error('hi'))
    await value.promise.catch(error => {
      assert.equal(error.message, 'hi')
    })
  })
})
