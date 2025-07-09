import { AsyncLocalStorage } from 'node:async_hooks'

export const useCtxHook = <T extends object>(object: T) => <K extends keyof T & string>(
  prop: K,
  factory: (original: T[K]) => T[K]
) => {
  const original = object[prop]
  const hooked = factory(original)

  const asyncLocalStorage = new AsyncLocalStorage<boolean>()

  Object.defineProperty(object, prop, {
    get: () => {
      if (asyncLocalStorage.getStore()) return hooked
      return original
    }
  })

  const dispose = () => {
    Object.defineProperty(object, prop, {
      get: () => original,
    })
  }

  const wrap = <A extends any[], R>(fn: (...args: A) => R): ((...args: A) => R) => {
    return (...args: A) => asyncLocalStorage.run(true, () => fn(...args))
  }

  return {
    dispose, wrap,
  }
}

export const useGlobalCtxHook = useCtxHook(global)
