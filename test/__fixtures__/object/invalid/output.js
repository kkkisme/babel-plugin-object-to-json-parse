const test1 = {
  method(arg) {
    return arg
  },

  b: 1
}
const test2 = { ...test1, b: 1 }
const test3 = {
  b: 'b_val',
  ['c']: 'c_val'
}
const test4 = {
  77777777777777777.1: 'foo'
}
const test5 = {
  foo: 1 + 2
}
const test6 = {
  foo: ``
}
const test7 = {
  foo: `te${'abc'}st`
}
const test8 = {
  foo: `te${123}st`
}
const test9 = {
  foo: `te${test2.b}st`
}