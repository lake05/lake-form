import { CommonWidgetPropsDefine } from '../types'
import { defineComponent } from 'vue'
import { withFormItem } from './FormItem'

const TextWidget = withFormItem(
  defineComponent({
    name: 'TextWidget',
    props: CommonWidgetPropsDefine,
    setup(props) {
      const handleChange = (e: Event) => {
        const target = e.target as HTMLInputElement
        const value = target.value
        target.value = props.value as string
        props.onChange(value)
      }
      return () => {
        return <input type="text" value={props.value} onInput={handleChange} />
      }
    },
  })
)

export default TextWidget
