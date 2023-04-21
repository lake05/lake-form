import { CommonWidgetNames, FieldPropsDefine } from '../types'
import { defineComponent } from 'vue'
import { getWidget } from '../theme'

export default defineComponent({
  props: FieldPropsDefine,
  setup(props) {
    const NumWidthRef = getWidget(CommonWidgetNames.NumberWidget)
    const handleChange = (e: unknown) => {
      const num = Number(e)
      if (Number.isNaN(num)) {
        props.onChange(undefined)
      } else {
        props.onChange(num)
      }
    }
    return () => {
      const NumWidth = NumWidthRef.value
      const { value, errorSchema, schema } = props
      return (
        <NumWidth
          value={value}
          errors={errorSchema.__errors}
          onChange={handleChange}
          schema={schema}
        />
      )
    }
  },
})
