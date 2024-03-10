# Inside Out Async

<!-- [![codecov](https://codecov.io/gh/reconbot/inside-out-async/branch/master/graph/badge.svg)](https://codecov.io/gh/reconbot/inside-out-async) -->
[![Release](https://github.com/reconbot/inside-out-async/actions/workflows/test.yml/badge.svg)](https://github.com/reconbot/inside-out-async/actions/workflows/test.yml)

It's pretty handy for turning things that are not promises and generators into promises and generators. Good for testing, but also for having more control over how things execute.

```ts
npm install inside-out-async
```

I [nerd sniped myself](https://twitter.com/reconbot/status/1424476981010255882) and made this library. `defer()` is easily written in any new project, `deferGenerator()` is not.

Exports two functions

## API

- [`defer()`](#withResolvers) _deprecated_
- [`deferGenerator()`](#deferGenerator)
- [`withResolvers()`](#withResolvers)

### withResolvers

```ts
function withResolvers<T>(): Deferred<T>

interface Deferred<T> {
    promise: Promise<T>
    resolve: (value: T) => void
    reject: (error: Error) => void
}
```

Returns an object containing a new Promise object and two functions to resolve or reject it, corresponding to the two parameters passed to the executor of the Promise() constructor. Like the `Promise` constructor but inside out.

*Update 2.0.0*  - With the release of [`Promise.withResolvers`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers) we've renamed `defer` to `withResolvers`. It is a suitable polyfill until browser support and user upgrades reach your particular critical mass.

```ts
import { withResolvers } from 'inside-out-async'
import { Trainer } from 'pokemon-trainer'

const { resolve, reject, promise } = withResolvers() // exactly the same as Promise.withResolvers()
const ash = new Trainer()
ash.on('capture', resolve)
ash.on('error', reject)

const pokemon = await promise
console.log(pokemon) // { name: 'Pikachu', temperament: 'surprised' }
```

### deferGenerator

```ts
function deferGenerator<T, TReturn, TNext = unknown>(): DeferredGenerator<T, TReturn, TNext>

interface DeferredGenerator<T, TReturn, TNext> {
    generator: AsyncGenerator<T, TReturn, TNext>
    queueValue: (value: T) => void
    error: (err?: any) => void
    queueError: (err?: any) => void
    return: (value?: TReturn) => void
    queueReturn: (value?: TReturn) => void
}
```

Creates an async generator and control functions. The async generator yields values, errors, and returns based on the control functions.

- `queueValue` queues a value to yielded next
- `error` drops all queued values, puts the generator in a "done" state, and has the current pending or next call to `next()` throw an error
- `queueError` puts the generator in a "done" state, and has the current pending or next call to `next()` throw an error
- `return()` drops all queued values, and puts the generator in a "done" state with the passed in value
- `queueReturn()` puts the generator in a "done" state with the passed in value

```ts
import { deferGenerator } from 'inside-out-async'

const pokedex = deferGenerator()
pokedex.queueValue({ name: 'Pikachu' })
pokedex.queueValue({ name: 'Bulbasaur' })
pokedex.queueValue({ name: 'Charizard' })
pokedex.queueReturn()

for await (const pokemon of pokedex.generator) {
  console.log(pokemon) // { name: 'Pikachu' }, { name: 'Bulbasaur' }, { name: 'Charizard' }
}
```
