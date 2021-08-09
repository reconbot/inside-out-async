import { assert } from 'chai'
import { defer } from './defer'

describe('defer', () => {
  it('resolves an inside out promise', async () => {
    const value = defer<'hi'>()
    value.resolve('hi')
    assert.equal(await value.promise, 'hi')
  })
  it('rejects an inside out promise', async () => {
    const value = defer<string>()
    value.reject(new Error('hi'))
    await value.promise.catch(error => {
      assert.equal(error.message, 'hi')
    })
  })
})
