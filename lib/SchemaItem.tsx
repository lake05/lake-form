import { defineComponent, computed } from 'vue'
import { SchemaTypes, FieldPropsDefine } from './types'

import StringField from './fields/StringField'
import NumberField from './fields/NumberField'
import ObjectField from './fields/ObjectField'

import { retrieveSchema } from './utils'
import ArrayField from './fields/ArrayField'

export default defineComponent({
  name: 'SchemaItem',
  props: FieldPropsDefine,
  setup(props) {
    const retrievedSchemaRef = computed(() => {
      const { schema, rootSchema, value } = props
      return retrieveSchema(schema, rootSchema, value)
    })

    return () => {
      const type = props.schema?.type
      // TODO: 如果type没有指定 我们需要猜测这个type

      let FieldComponent

      switch (type) {
        case SchemaTypes.OBJECT:
          FieldComponent = ObjectField
          break
        case SchemaTypes.STRING:
          FieldComponent = StringField
          break
        case SchemaTypes.NUMBER:
          FieldComponent = NumberField
          break
        case SchemaTypes.ARRAY:
          FieldComponent = ArrayField
          break
        default:
          break
      }

      return FieldComponent ? (
        <FieldComponent {...props} schema={retrievedSchemaRef.value} />
      ) : null
    }
  },
})
