export function withResolvers<T>(): Deferred<T> {
  let reject
  let resolve
  const promise = new Promise<T>((resolveFunc, rejectFunc) => {
    resolve = resolveFunc
    reject = rejectFunc
  })
  return {
    promise,
    reject,
    resolve,
  }
}

/**
 * @deprecated With the release of [`Promise.withResolvers`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers) we've renamed `defer` to `withResolvers`.
 */
export interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (error: Error) => void
}

export const defer = withResolvers
