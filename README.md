# Inside Out Async

[![codecov](https://codecov.io/gh/reconbot/inside-out-async/branch/master/graph/badge.svg)](https://codecov.io/gh/reconbot/inside-out-async)
[![Release](https://github.com/reconbot/inside-out-async/actions/workflows/test.yml/badge.svg)](https://github.com/reconbot/inside-out-async/actions/workflows/test.yml)

I [nerd sniped myself](https://twitter.com/reconbot/status/1424476981010255882) and made this library.

Exports two functions

## API

- [`defer()`](#defer)
- [`deferGenerator()`](#deferGenerator)

### defer

```ts
function defer<T>(): Deferred<T>

interface Deferred<T> {
    promise: Promise<T>
    resolve: (value: T) => void
    reject: (error: Error) => void
}
```

Creates a promise and control functions. The promise is resolved and rejected by the control functions. Like the `Promise` constructor but inside out.

```ts
import { defer } from 'inside-out-async'
import { Trainer } from 'pokemon-trainer'

const pokemonCaught = defer()
const ash = new Trainer()
ash.on('capture', pokemonCaught.resolve)
ash.on('error', pokemonCaught.reject)

const pokemon = await pokemonCaught.promise
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
