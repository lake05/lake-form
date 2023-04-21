import { CommonWidgetPropsDefine } from '../types'
import { defineComponent } from 'vue'
import { withFormItem } from './FormItem'

const NumberWidget = withFormItem(
  defineComponent({
    props: CommonWidgetPropsDefine,
    setup(props) {
      const handleChange = (e: Event) => {
        const target = e.target as HTMLInputElement

        props.onChange(target.value)
      }
      return () => {
        return (
          <input type="number" value={props.value} onInput={handleChange} />
        )
      }
    },
  })
)

export default NumberWidget
