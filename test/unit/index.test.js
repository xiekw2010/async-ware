const MW = require('../../index')
const assert = require('assert')
const R = require('ramda')

const sleep = x => new Promise(resolve => {
  setTimeout(resolve, x)
})

describe('Middleware params test cases', function () {
  it('should use right count of _fns', async function () {
    const ware = async function (ctx, next) {
      assert(this._fns.length === 2)
      ctx.a = ctx.a + 1
      await next()
      return ctx
    }
    const mw1 = new MW(ware)
    mw1
      .use(ware)

    const res1 = await mw1.run({ a: 0 })
    assert(res1.a === 2)
  })

  it('should be abled to mixed with other middlewares', async function () {
    const ware = async function (ctx, next) {
      ctx.a = ctx.a + 1
      await next()
      return ctx
    }
    const mw1 = new MW(ware)
    const mw2 = new MW(ware)
    mw1
      .use(mw2)
      .use(ware)

    const res1 = await mw1.run({ a: 0 })
    assert(res1.a === 3)

    const res2 = await mw2.run({ a: 100 })
    assert(res2.a === 101)
  })

  it('should throw error when using wrong fn obj', async function () {
    const ware = { a: 3 }
    const mw1 = new MW(ware)
    const mw2 = new MW(ware)
    mw1
      .use(mw2)
      .use(ware)

    try {
      await mw1.run({ a: 0 })
    } catch (err) {
      assert(err.message ===
        'Middleware must be composed of functions!')
    }
  })

  it('should throw error when _compose run _fns', async function () {
    const mw1 = new MW()
    mw1._fns = 's'

    try {
      await mw1.run({ a: 0 })
    } catch (err) {
      assert(err.message ===
        'Middleware stack must be an array!')
    }
  })
})

describe('Middleware functional test cases', function () {
  it('should run as ware1, ware2, ware3 order', async function () {
    const obja = { a: 10 }
    const objb = { b: 20 }

    const ware1 = async (a, b, next) => {
      assert(R.propEq('a', 10, obja))
      assert(R.propEq('b', 20, objb))
      ++a.a
      await next()
      ++b.b
      assert(R.propEq('a', 13, obja))
      assert(R.propEq('b', 23, objb))
    }

    const ware2 = async (a, b, next) => {
      assert(R.propEq('a', 11, obja))
      assert(R.propEq('b', 20, objb))
      ++a.a
      await sleep(200)
      await next()
      assert(R.propEq('b', 21, objb))
      await sleep(300)
      ++b.b
    }

    const ware3 = async (a, b, next) => {
      assert(R.propEq('a', 12, obja))
      assert(R.propEq('b', 20, objb))
      ++a.a
      await sleep(200)
      await next()
      await sleep(300)
      ++b.b
    }

    const mw = new MW([ware1, ware2, ware3])
    await mw.run(obja, objb)
  })

  it('should run catch error, ware1 ok, ware2 error, ware3 not run', async function () {
    const obja = { a: 10 }
    const objb = { b: 20 }

    const ware1 = async (a, b, next) => {
      assert(R.propEq('a', 10, obja))
      assert(R.propEq('b', 20, objb))
      ++a.a
      await next()
      ++b.b
      assert(R.propEq('a', 13, obja))
      assert(R.propEq('b', 23, objb))
    }

    const ware2 = async (a, b, next) => {
      assert(R.propEq('a', 11, obja))
      assert(R.propEq('b', 20, objb))
      ++a.a
      await sleep(200)
      let err
      err.throw()
      await next()
      assert(R.propEq('b', 21, objb))
      await sleep(300)
      ++b.b
    }

    const ware3 = async (a, b, next) => {
      console.log('not running')
      assert(R.propEq('a', 12, obja))
      assert(R.propEq('b', 20, objb))
      ++a.a
      await sleep(200)
      await next()
      await sleep(300)
      ++b.b
    }

    const mw = new MW([ware1, ware2, ware3])
    try {
      await mw.run(obja, objb)
    } catch (err) {
      R.equals("Cannot read property 'throw' of undefined", err.message)
    }
  })

  it('should support pass this as ctx', async function () {
    const ctx = this;
    ctx.a = 0

    const ware1 = async (ctx, next) => {
      assert(R.propEq('a', 0, ctx))
      ctx.a = '3'
      await next()
      assert(R.propEq('a', '6', ctx))
      return ctx
    }

    const ware2 = async (ctx, next) => {
      assert(R.propEq('a', '3', ctx))
      ctx.a = '4'
      await sleep(200)
      await next()
      assert(R.propEq('a', '5', ctx))
      ctx.a = '6'
      await sleep(300)
    }

    const ware3 = async (ctx, next) => {
      assert(R.propEq('a', '4', ctx))
      ctx.a = '5'
      await sleep(200)
      await next()
      await sleep(300)
    }

    const mw = new MW([ware1, ware2, ware3])
    const { a } = await mw.run(ctx)
    assert(a === '6')
  })

  it('should not run ware3', async function () {
    const ctx = this;
    ctx.a = 0

    const ware1 = async (ctx, next) => {
      assert(R.propEq('a', 0, ctx))
      ctx.a = '3'
      await next()
      assert(R.propEq('a', '6', ctx))
      return ctx
    }

    const ware2 = async (ctx, next) => {
      assert(R.propEq('a', '3', ctx))
      ctx.a = '4'
      await sleep(200)
      assert(R.propEq('a', '4', ctx))
      ctx.a = '6'
      await sleep(300)
    }

    const ware3 = async (ctx, next) => {
      console.log('NOT running3')
      assert(R.propEq('a', '4', ctx))
      ctx.a = '5'
      await sleep(200)
      await next()
      await sleep(300)
    }

    const mw = new MW([ware1, ware2, ware3])
    const { a } = await mw.run(ctx)
    assert(a === '6')
  })

  it('should work with normal function', function () {
    const obja = { a: 0 }
    const ware1 = (ctx, next) => {
      assert(R.propEq('a', 0, ctx))
      obja.a = obja.a + 1
      next()
      assert(R.propEq('a', 3, ctx))
    }

    const ware2 = (ctx, next) => {
      assert(R.propEq('a', 1, ctx))
      obja.a = obja.a + 1
      next()
    }

    const ware3 = (ctx, next) => {
      assert(R.propEq('a', 2, ctx))
      obja.a = obja.a + 1
      next()
    }

    const mw = new MW([ware1, ware2, ware3])
    mw.run(obja)
  })

  it('should work with mixed function, but not recommended', function () {
    const obja = { a: 0 }
    const ware1 = (ctx, next) => {
      assert(R.propEq('a', 0, ctx))
      obja.a = obja.a + 1
      next()
      assert(ctx.a !== 3)
    }

    const ware2 = async (ctx, next) => {
      assert(R.propEq('a', 1, ctx))
      obja.a = obja.a + 1
      await sleep(1000)
      await next()
      await sleep(500)
    }

    const ware3 = (ctx, next) => {
      assert(R.propEq('a', 2, ctx))
      obja.a = obja.a + 1
      next()
    }

    const mw = new MW([ware1, ware2, ware3])
    mw.run(obja)
  })

  it('should accept none args but use next as default', async function () {
    const obja = { a: 0 }
    const ware1 = (ctx, next) => {
      assert(R.is(Function, ctx))
      obja.a = obja.a + 1
    }

    const mw = new MW([ware1])
    await mw.run()
  })

  it('should throw error when fn wrong', async function () {
    const ware1 = () => { throw new Error(1) }

    const mw = new MW([ware1])
    try {
      await mw.run()
    } catch (err) {
      assert(err.message === '1')
    }
  })

  it('should throw error when called twice', async function () {
    const obja = { a: 0 }
    const ware1 = async (ctx, next) => {
      await next()
      await next()
      return { a: 0 }
    }

    const mw = new MW([ware1])
    try {
      await mw.run(obja)
    } catch (err) {
      assert(err.message === 'next() called multiple times')
    }
  })
})
