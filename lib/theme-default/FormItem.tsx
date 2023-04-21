import { CommonWidgetPropsDefine } from '../types'
import { defineComponent } from 'vue'

const FormItem = defineComponent({
  name: 'FormItem',
  props: CommonWidgetPropsDefine,
  setup(props, { slots }) {
    return () => {
      const { schema, errors } = props
      return (
        <div>
          <label class="block text-gray-600">{schema.title}</label>
          {slots.default && slots.default()}
          <div class="text-red-600 text-sm">
            {errors?.map((error) => (
              <li>{error}</li>
            ))}
          </div>
        </div>
      )
    }
  },
})

export default FormItem

// 高阶组件 HOC 抽离渲染部分的逻辑；解耦, dont care how to use FormItem here
// composition api只能抽离非渲染部分的逻辑
export function withFormItem(Widget: any) {
  return defineComponent({
    name: `Wrapped${Widget.name}`,
    props: CommonWidgetPropsDefine,
    setup(props, { attrs, slots }) {
      return () => {
        return (
          <FormItem {...props}>
            <Widget {...props} {...attrs} slot={slots} />
          </FormItem>
        )
      }
    },
  })
}
