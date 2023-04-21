let bucket = new WeakMap() // 经常用于存储那些只有当key所引用的对象存在时
let activeEffect

// effect 栈
// 当副作用函数发生嵌套时，内层副作用函数的执行会覆盖 activeEffect 的值，并且永远不会恢复到原来的值。
const effectStack = []

// 注册effect
function effect(fn, options = {}) {
  // 每次副作用函数执行时，我们可以先把它从所有与之关联的依赖集合中删除

  const effectFn = () => {
    // 每次副作用函数执行时，根据effectFn.deps获取所有相关联的依赖集合，进而将副作用函数从依赖集合中移除
    cleanup(effectFn)

    activeEffect = effectFn

    effectStack.push(effectFn)

    fn()

    effectStack.pop()

    activeEffect = effectStack[effectStack.length - 1]
  }

  effectFn.options = options

  effectFn.deps = []

  effectFn() // 触发Proxy get
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }

  effectFn.deps.length = 0
}

// effect(function effectFn() {
//   document.body.innerText = obj.text
// })

const data = { ok: true, foo: true, bar: true }
const obj = new Proxy(data, {
  get(target, key) {
    // 无论读取的是哪一个属性，其实都一样，都会把副作用函数收集到“桶”里
    // activeEffect && bucket.add(activeEffect)

    if (!activeEffect) return target[key]

    let depsMaps = bucket.get(target)
    if (!depsMaps) {
      bucket.set(target, (depsMaps = new Map()))
    }

    let deps = depsMaps.get(key)
    if (!deps) {
      depsMaps.set(key, (deps = new Set()))
    }

    deps.add(activeEffect)
    activeEffect.deps.push(deps)

    return target[key]
  },

  set(target, key, newVal) {
    target[key] = newVal
    // 当设置属性时，无论设置的是哪一个属性，也都会把副作用函数取出并执行。
    //bucket.foreach(fn => fn())

    let depsMaps = bucket.get(target)
    if (!depsMaps) return
    const effects = depsMaps.get(key)

    // effects && effects.forEach(fn => fn())

    const effectToRun = new Set()
    effects &&
      effects.forEach((effectFn) => {
        // 读取和设置操作是在同一个副作用函数内进行的
        // 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行

        if (effectFn !== activeEffect) {
          effectToRun.add(effectFn)
        }
      })

    effectToRun.forEach((effectFn) => {
      // 如果副作用函数有调度器 则调用调度器 将副作用函数传递
      if (effectFn.options.schedule) {
        effectFn.options.schedule(effectFn)
      } else {
        effectFn()
      }
    })
  },
})

// effect(function effectFn() {
//   document.title = obj.ok ? obj.text : 'not'
// })

// obj.ok = false

// setTimeout(() => {
//   obj.text = 'hello world!'
//   obj.bar = 1
//   console.log('bucket: ', bucket)
// }, 2000)

// let temp1, temp2

// effect(function effectFn1() {
//   console.log('effectFn1: 执行')

//   effect(function effectFn2() {
//     console.log('effectFn2: 执行')

//     temp2 = obj.bar
//   })

//   temp1 = obj.foo
// })

// setTimeout(() => {
//   obj.foo = 1
//   console.log('bucket: ', bucket)
//   setTimeout(() => {
//     obj.bar += 1
//     console.log('obj.bar: ', obj.bar)
//   }, 2000)
// }, 2000)

// 调度器
const jobQueue = new Set()
const p = Promise.resolve()

// 是否正在刷新队列
let isFlushing = false

function flushJob() {
  // 如何队列正在刷新， 则什么都不做
  if (isFlushing) return

  isFlushing = true // 正在刷新

  // 在微任务队列种刷新 jobQueue 队列
  p.then(() => {
    jobQueue.forEach((job) => job())
  }).finally(() => {
    isFlushing = false
  })
}

effect(() => console.log(obj.foo), {
  schedule: (fn) => {
    // set动作触发副作用函数重新执行时，有能力决定副作用函数执行的时机、次数以及方式
    jobQueue.add(fn)
    flushJob()
  },
}) // Maximum call stack size exceeded

obj.foo.a.b++
console.log('结束了')
