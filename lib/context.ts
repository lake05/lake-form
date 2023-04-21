import { inject, InjectionKey } from 'vue'
import { CommonFieldType } from './types'

export const SchemaFormContextKey = Symbol() as InjectionKey<{
  SchemaItem: CommonFieldType
}>

export function useCommonFieldContext() {
  const context = inject(SchemaFormContextKey)

  if (!context) {
    throw new Error('SchemaForm should be  used')
  }

  return context
}
