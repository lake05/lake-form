import { useCommonFieldContext } from '..//context'
import { defineComponent } from 'vue'
import { FieldPropsDefine } from '../types'
import { isObject } from '../utils'

export default defineComponent({
  name: 'ObjectField',
  props: FieldPropsDefine,
  setup(props) {
    const context = useCommonFieldContext()

    const handleObjectFieldChange = (key: string, v: unknown) => {
      const value = isObject(props.value) ? props.value : {}

      if (v === undefined) {
        delete value.key
      } else {
        value[key] = v
      }

      props.onChange(value)
    }

    return () => {
      const { schema, rootSchema, value, errorSchema, uiSchema } = props
      const properties = schema.properties || {}
      const { SchemaItem } = context

      const currentValue = isObject(value) ? value : {}
      return Object.keys(properties).map((k: string, index: number) => (
        <SchemaItem
          schema={properties[k]}
          rootSchema={rootSchema}
          value={currentValue[k]}
          errorSchema={errorSchema[k] || {}}
          key={index}
          onChange={(v) => handleObjectFieldChange(k, v)}
          uiSchema={uiSchema.properties ? uiSchema.properties[k] || {} : {}}
        />
      ))
    }
  },
})
