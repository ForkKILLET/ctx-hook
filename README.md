# ctx-hook

[![npm](https://img.shields.io/npm/v/ctx-hook?style=flat-square)](https://www.npmjs.com/package/ctx-hook)

## Overview
`ctx-hook` is a TypeScript library that uses Node.js's [asynchronous context tracking](https://nodejs.org/api/async_context.html) to enable property hooking that activates only within the asynchronous contexts of wrapper functions created by its API.

## Example

```typescript
import { useGlobalCtxHook, useCtxHook } from 'ctx-hook'

// Create a context hook for `global.Date` to travel to 1 day ago.
const { wrap, dispose } = useGlobalCtxHook('Date', Date0 => {
  const getTravelledNow = () => Date0.now() - 864e5
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

// Define a function that outputs the current time twice.
const fn = async () => {
  console.log(Date.now())
  await new Promise(resolve => setTimeout(resolve, 0))
  console.log(Date.now())
}

// Wrap the function so that all access (sync or async) to `Date` will be hooked.
const fnTravelled = wrap(fn)

fnTravelled()

// Dispose the context hook to restore the original `Date`.
dispose()
```