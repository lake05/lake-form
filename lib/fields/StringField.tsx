import { CommonWidgetNames, FieldPropsDefine } from '../types'
import { defineComponent } from 'vue'
import { getWidget } from '../theme'

export default defineComponent({
  name: 'StringField',
  props: FieldPropsDefine,
  setup(props) {
    const TextWidthRef = getWidget(CommonWidgetNames.TextWidget)
    const handleChange = (e: unknown) => {
      props.onChange(e)
    }
    return () => {
      const TextWidth = TextWidthRef.value
      const { schema, value, errorSchema } = props
      return (
        <TextWidth
          value={value}
          errors={errorSchema.__errors}
          schema={schema}
          onChange={handleChange}
        />
      )
    }
  },
})
