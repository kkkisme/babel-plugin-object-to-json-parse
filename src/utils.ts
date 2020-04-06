import {
  isArrayExpression,
  isBooleanLiteral,
  isObjectExpression,
  isNullLiteral,
  isNumericLiteral,
  isStringLiteral,
  ObjectExpression,
  ObjectProperty,
  isObjectProperty,
  NumericLiteral,
  StringLiteral,
  BooleanLiteral,
  ArrayExpression,
  NullLiteral
} from '@babel/types'

type ValidJsonValue =
  | NumericLiteral
  | StringLiteral
  | BooleanLiteral
  | NullLiteral
  | ArrayExpression
  | ObjectExpression

const isValidJsonValue = (
  node: object | null | undefined
): node is ValidJsonValue => {
  if (
    isNumericLiteral(node) ||
    isStringLiteral(node) ||
    isBooleanLiteral(node) ||
    isNullLiteral(node) ||
    isArrayExpression(node) ||
    isObjectExpression(node)
  ) {
    return true
  }

  return false
}

type ObjectExpressionWithOnlyObjectProperties = Omit<
  ObjectExpression,
  'properties'
> & {
  properties: ObjectProperty[]
}

/**
 * Check whether given ObjectExpression consists of only `ObjectProperty`s as its properties.
 */
const isObjectExpressionWithOnlyObjectProperties = (
  node: ObjectExpression
): node is ObjectExpressionWithOnlyObjectProperties => {
  return node.properties.every(property => isObjectProperty(property))
}

const isConvertibleObjectProperty = (properties: ObjectProperty[]) => {
  return properties.every(node => !node.computed)
}

export function converter(node: object | null | undefined): unknown {
  if (!isValidJsonValue(node)) {
    throw new Error('Invalid value is included.')
  }

  if (isStringLiteral(node)) {
    const { value } = node
    if (/"/.test(value)) {
      return value.replace(/"/g, '\\"')
    }

    if (/[\t\f\r\n\b]/g.test(value)) {
      const codes = ['\t', '\f', '\r', '\n', '\t', '\b']
      const replaceCodes = ['\\t', '\\f', '\\r', '\\n', '\\t', '\\b']
      let replaceValue = value
      for (let i = 0; i < codes.length; i++) {
        replaceValue = replaceValue.replace(
          new RegExp(codes[i]),
          replaceCodes[i]
        )
      }
      return replaceValue
    }

    return value
  }

  if (isNullLiteral(node)) {
    return null
  }

  if (isArrayExpression(node)) {
    const { elements } = node
    return elements.map(node => converter(node))
  }

  if (isObjectExpression(node)) {
    if (!isObjectExpressionWithOnlyObjectProperties(node)) {
      throw new Error('Invalid syntax is included.')
    }

    const { properties } = node
    if (!isConvertibleObjectProperty(properties)) {
      throw new Error('Invalid syntax is included.')
    }

    return properties.reduce((acc, cur) => {
      const key = cur.key.name || cur.key.value
      // see issues#10
      if (typeof key === 'number' && !Number.isSafeInteger(key)) {
        throw new Error('Invalid syntax is included.')
      }
      const value = converter(cur.value)
      return { ...acc, [key]: value }
    }, {})
  }

  return node.value
}
