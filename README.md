# async-ware

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![License][license-image]][license-url]

The programming idea(🧅 onion model) of koa middleware is great, it can be applied to more situations.

We need one class to include that all, so here comes this lib

- ✅ use it in one class(no need to include koa), see code example below
- ✅ variadic arguments for the whole running
- ✅ catch the error by `ware.run()` 's promise

## How to use

### Install
```
npm i async-ware -S
```

### Example

```js
const Middleware = require('async-ware')

const ware = new Middleware()

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

// The middlewares above, function's arguments a and b is the `run` function's arguments
// You can use variadic arguments here
ware.run({ a: 10 }, { b: 20 })
  .then(console.log)
  .catch(console.error)
```

## License

  MIT

[npm-image]: https://img.shields.io/npm/v/async-ware.svg?style=flat-square
[npm-url]: https://npmjs.org/package/async-ware
[travis-image]: https://travis-ci.org/xiekw2010/async-ware.svg?branch=master
[travis-url]: https://travis-ci.org/xiekw2010/async-ware
[codecov-image]: https://codecov.io/gh/xiekw2010/async-ware/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/xiekw2010/async-ware
[license-image]: http://img.shields.io/npm/l/async-ware.svg?style=flat-square
[license-url]: LICENSE
