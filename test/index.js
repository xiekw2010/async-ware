const Ware = require('../dist/lib').default

const sleep = x => new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log('sleeping x', x)
    resolve()
  }, x)
})

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

// for testing error
// ware.use(async (a, b, next) => {
//   console.log('middleware 4a ***', ++a.a, a)
//   throw new Error('1')
//   console.log('middleware 4b ***', ++b.b)
// })

ware.use(async (a, b, next) => {
  console.log('middleware 5a ***', ++a.a, a)
  console.log('middleware 5b ***', ++b.b, b)
  await next()
})

ware.run({a: 10}, {b: 20}).then().catch(err => console.log(err))