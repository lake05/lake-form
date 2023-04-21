import Ajv, { ErrorObject } from 'ajv'
import localize from 'ajv-i18n'
import { hasOwn, isObject, toPath } from './utils'
import { Language, Schema } from './types'
import { CustomValidate } from './types'

interface TransformErrorsObject {
  name: string
  property: string
  message?: string
  params: Record<string, any>
  schemaPath: string
}

export type ErrorSchema = {
  [level: string]: ErrorSchema
} & { __errors?: string[] }

function toErrorSchema(errors: TransformErrorsObject[]) {
  if (errors.length < 1) return {}

  return errors.reduce((errorSchema, error) => {
    const { property, message } = error
    const path = toPath(property)

    let parent = errorSchema

    // if path is at the root '/src/...'
    if (path.length > 0 && path[0] === '') {
      path.splice(0, 1)
    }

    for (const segment of path.slice(0)) {
      if (!(segment in parent)) {
        ;(parent[segment] as any) = {}
      }
      parent = parent[segment]
    }

    if (Array.isArray(parent.__errors)) {
      parent.__errors = parent.__errors.concat(message || '')
    } else {
      if (message) {
        parent.__errors = [message]
      }
    }
    return errorSchema
  }, {} as ErrorSchema)
}

function transformErrors(
  errors: ErrorObject[] | null | undefined
): TransformErrorsObject[] {
  if (errors === null || errors === undefined) return []

  return errors.map(
    ({ message, schemaPath, keyword, params, instancePath }) => {
      return {
        name: keyword,
        property: instancePath,
        message,
        params,
        schemaPath,
      }
    }
  )
}

export async function validateFormData(
  validator: Ajv,
  formData: unknown,
  schema: Schema,
  locale: Language = 'zh',
  customValidate?: CustomValidate
) {
  let validationError = null
  try {
    validator.validate(schema, formData)
  } catch (error) {
    validationError = error as Error
  }
  localize[locale](validator.errors)
  let errors = transformErrors(validator.errors)

  if (validationError) {
    errors = [
      ...errors,
      {
        message: validationError.message,
      } as TransformErrorsObject,
    ]
  }

  const errorSchema = toErrorSchema(errors)

  if (!customValidate) {
    return {
      errors,
      errorSchema,
      valid: errors.length === 0,
    }
  }

  /**
   * {
   *  obj: {
   *    a: {b: {__error: ''}}
   *  }
   * }
   */
  const proxy = createErrorProxy()
  await customValidate(formData, proxy)

  const newErrorSchema = mergeObjects(errorSchema, proxy, true)

  return {
    errors,
    errorSchema: newErrorSchema,
    valid: errors.length === 0,
  }
}

function createErrorProxy() {
  const obj = {}
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'addError') {
        return (msg: string) => {
          const __errors = Reflect.get(target, '__errors', receiver)

          if (__errors && Array.isArray(__errors)) {
            __errors.push(msg)
          } else {
            ;(target as any).__errors = [msg]
          }
        }
      }
      const res = Reflect.get(target, key, receiver)

      if (res === undefined) {
        const p: any = createErrorProxy()
        ;(target as any)[key] = p // 防止重复触发getter 不能直接读取
        return p
      }
      return res
    },
  })
}

export function mergeObjects(obj1: any, obj2: any, concatArrays = false) {
  // Recursively merge deeply nested objects.
  const acc = { ...obj1 } // prevent mutation of source object

  return Object.keys(obj2).reduce((acc, key) => {
    const left = obj1 ? obj1[key] : {},
      right = obj2[key]
    if (obj1 && hasOwn(obj1, key) && isObject(right)) {
      acc[key] = mergeObjects(left, right, concatArrays)
    } else if (concatArrays && Array.isArray(left) && Array.isArray(right)) {
      acc[key] = left.concat(right)
    } else {
      acc[key] = right
    }
    return acc
  }, acc)
}
