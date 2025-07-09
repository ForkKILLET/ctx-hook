import { expect, it } from 'vitest'
import { useGlobalCtxHook, useCtxHook } from '../src/index'

it('hook', async () => {
  const object = {
    foo: 'bar',
  }
  const { wrap, dispose } = useCtxHook(object)('foo', () => 'baz')
  const getFoo = wrap(async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
    return object.foo
  })
  const promise = getFoo()
  expect(object.foo).toBe('bar')
  expect(await promise).toBe('baz')
  dispose()
  expect(object.foo).toBe('bar')
})

it('time travel', () => {
  const { wrap, dispose } = useGlobalCtxHook('Date', Date0 => {
    const getTravelledNow = () => 0
    const getTravelledDate = () => new Date0(getTravelledNow())
    const Date1 = new Proxy(Date0, {
      construct(_, args) {
        if (! args.length) return getTravelledDate()
        return new Date0(...args as [])
      },
      apply() {
        return getTravelledDate().toString()
      },
      get(_, prop: keyof DateConstructor) {
        if (prop === 'now') return getTravelledNow
        return Date0[prop]
      }
    })
    return Date1
  })

  const now = wrap(() => Date.now())()
  const date = wrap(() => new Date())()
  const now0 = Date.now()
  const date0 = new Date()
  dispose()

  expect(now).toBe(0)
  expect(date.getTime()).toBe(0)
  expect(now0).not.toBe(0)
  expect(date0.getTime()).not.toBe(0)
})

