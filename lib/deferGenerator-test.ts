import { assert } from 'chai'
import { collect } from 'streaming-iterables'
import { deferGenerator } from './deferGenerator'

describe('deferGenerator', () => {
  it('queues up values until queueReturn is called', async () => {
    const deferred = deferGenerator<number, undefined>()
    deferred.queueValue(1)
    deferred.queueValue(2)
    deferred.queueValue(3)
    deferred.queueReturn(undefined)
    const values = await collect(deferred.generator)
    assert.deepEqual(values, [1, 2, 3])
  })

  it('immediately returns if return is called', async () => {
    const deferred = deferGenerator<number, undefined>()
    deferred.queueValue(1)
    deferred.queueValue(2)
    deferred.queueValue(3)
    deferred.return(undefined)
    const values = await collect(deferred.generator)
    assert.deepEqual(values, [])
  })

  it('queues up values until queueError is called', async () => {
    const deferred = deferGenerator<number, undefined>()
    deferred.queueValue(1)
    deferred.queueValue(2)
    deferred.queueValue(3)
    deferred.queueError(new Error('oh no!'))
    const values: number[] = []
    try {
      for await (const val of deferred.generator) {
        values.push(val)
      }
      throw new Error('should have errored')
    } catch (e) {
      assert.equal(e.message, 'oh no!')
    }
    assert.deepEqual(values, [1, 2, 3])
  })

  it('immediately error if error is called', async () => {
    const deferred = deferGenerator<number, undefined>()
    deferred.queueValue(1)
    deferred.queueValue(2)
    deferred.queueValue(3)
    deferred.error(new Error('oh no!'))
    const values: number[] = []
    try {
      for await (const val of deferred.generator) {
        values.push(val)
      }
      throw new Error('should have errored')
    } catch (e) {
      assert.equal(e.message, 'oh no!')
    }
    assert.deepEqual(values, [])
  })
})
