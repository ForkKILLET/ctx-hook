import { AsyncLocalStorage } from 'node:async_hooks'

type StoreType<S> = [ S ] extends [ never ] ? null : S
type StoreArgType<S> = [ S ] extends [ never ] ? [] : [ S ]


export const useCtxHook = <T extends object>(object: T) => <S = never, K extends keyof T & string = keyof T & string>(
  prop: K,
  factory: (original: T[K], store: StoreType<S>) => T[K]
) => {
  const asyncLocalStorage = new AsyncLocalStorage<StoreType<S>>()
  const original = object[prop]
  const hooked = (store: StoreType<S>) => factory(original, store)

  Object.defineProperty(object, prop, {
    get: (): T[K] => {
      const store = asyncLocalStorage.getStore()
      if (store === undefined) return original
      return hooked(store)
    }
  })

  const dispose = () => {
    Object.defineProperty(object, prop, {
      get: () => original,
    })
  }

  const wrap = <A extends any[], R>(fn: (...args: A) => R, ...[store]: StoreArgType<S>): ((...args: A) => R) => {
    return (...args: A) => asyncLocalStorage.run((store ?? null) as StoreType<S>, () => fn(...args))
  }

  return {
    dispose, wrap,
  }
}

export const useGlobalCtxHook = useCtxHook(global)
