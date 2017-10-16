# Middleware
A class for easily writing js middlewares

## how to use

```js
import Middleware from 'Middleware'

const ware = new Middleware()

const ware = new Ware()
ware.use(async (a, b, next) => {
  console.log('middleware 1a ***', ++a.a, a)
  await next()
  console.log('middleware 1b ***', ++b.b, b)
})

ware.use(async (a, b, next) => {
  console.log('middleware 2a ***', ++a.a, a)
  await sleep(200)
  await next()
  await sleep(300)
  console.log('middleware 2b ***', ++b.b, b)
})

ware.use(async (a, b, next) => {
  console.log('middleware 3a ***', ++a.a, a)
  await sleep(400)
  await next()
  await sleep(500)
  console.log('middleware 3b ***', ++b.b, b)
})

ware.run({a: 10}, {b: 20}).then().catch(err => console.log(err))
```

## Features

- [x] support async/await function
- [x] any args for middleware
- [x] catch the error by `ware.run()` 's promise

## caveats

The `this` context is not supported by `Middleware` to pass, instead, pass it as an argument in the middleware function's params.