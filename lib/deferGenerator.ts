/* eslint-disable @typescript-eslint/no-explicit-any */
import { defer } from './defer'

interface ValueType {
  type: string
}

interface ValueValue<T> extends ValueType {
  type: 'value'
  done: false,
  value: T
}

interface ErrorValue extends ValueType {
  type: 'error'
  error: any
}

interface DoneValue extends ValueType {
  type: 'done'
  done: true,
  value: any
}

type IteratorValues<T> = ValueValue<T> | ErrorValue | DoneValue

export function deferGenerator<T, TReturn, TNext = unknown>(): DeferredGenerator<T, TReturn, TNext> {
  let yieldValues: IteratorValues<T>[] = []
  let somethingToHappen = defer()

  const setupNextCycle = () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    somethingToHappen.promise.catch(() => {}).then(() => {
      somethingToHappen = defer()
      setupNextCycle()
    })
  }

  setupNextCycle()

  let pendingNext = false
  const somethingHappened = () => {
    if (pendingNext) {
      somethingToHappen.resolve(undefined)
    }
  }

  let stopped = false

  const queueValue = (value: T) => {
    if (stopped) {
      return
    }
    yieldValues.push({ type: 'value', done: false, value })
    somethingHappened()
  }

  const errorFunc = (error?: any) => {
    if (stopped) {
      return
    }
    stopped = true
    yieldValues = []
    yieldValues.push({ type: 'error', done: true, value: undefined, error })
    yieldValues.push({ type: 'done', done: true, value: undefined })
    somethingHappened()
  }

  const queueError = (error?: any) => {
    if (stopped) {
      return
    }
    stopped = true
    yieldValues.push({ type: 'error', done: true, value: undefined, error })
    yieldValues.push({ type: 'done', done: true, value: undefined })
    somethingHappened()
  }

  const returnFunc = (value?: TReturn) => {
    if (stopped) {
      return
    }
    stopped = true
    yieldValues = [{ type: 'done', done: true, value }]
    somethingHappened()
  }

  const queueReturn = (value: TReturn) => {
    if (stopped) {
      return
    }
    stopped = true
    yieldValues.push({ type: 'done', done: true, value })
    somethingHappened()
  }


  const generator:AsyncGenerator<T, TReturn, TNext> = {

    async next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>> {
      if (yieldValues.length > 0) {
        const iteratorValue = yieldValues[0].type === 'done' ? yieldValues[0] : yieldValues.shift()
        if (!iteratorValue) {
          throw new Error('impossible')
        }

        if (iteratorValue.type === 'error') {
          throw iteratorValue.error
        }

        const { done, value } = iteratorValue
        return { done, value }
      }

      pendingNext = true
      await somethingToHappen.promise
      pendingNext = false
      return generator.next(...args)
    },
    async return(value: TReturn | PromiseLike<TReturn>): Promise<IteratorResult<T, TReturn>> {
      const syncValue = await value
      returnFunc(syncValue)
      return generator.next()
    },
    async throw(e: any): Promise<IteratorResult<T, TReturn>> {
      returnFunc(undefined)
      throw e || new Error('Unspecified Error')
    },
    [Symbol.asyncIterator]: () => generator,
  }

  return {
    generator,
    queueValue,
    error: errorFunc,
    queueError,
    return: returnFunc,
    queueReturn,
  }
}

export interface DeferredGenerator<T, TReturn, TNext> {
 generator: AsyncGenerator<T, TReturn, TNext>
 queueValue: (value: T) => void
 error: (err?: any) => void
 queueError: (err?: any) => void
 return: (value?: TReturn) => void
 queueReturn: (value?: TReturn) => void
}
