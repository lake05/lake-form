import { defineComponent, PropType } from 'vue'
import { FieldPropsDefine, Schema, SelectionWidgetNames } from '../types'
import { useCommonFieldContext } from '../context'

import { getWidget } from '../theme'

const ArrayItemWrapper = defineComponent({
  name: 'ArrayItemWrapper',
  props: {
    onAdd: {
      type: Function as PropType<(index: number) => void>,
      required: true,
    },
    onDelete: {
      type: Function as PropType<(index: number) => void>,
      required: true,
    },
    onUp: {
      type: Function as PropType<(index: number) => void>,
      required: true,
    },
    onDown: {
      type: Function as PropType<(index: number) => void>,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  setup(props, { slots }) {
    return () => {
      const handleApp = () => props.onAdd(props.index)
      const handleDelete = () => props.onDelete(props.index)
      const handleUp = () => props.onUp(props.index)
      const handleDown = () => props.onDown(props.index)

      return (
        <div class="border border-gray-400 my-2">
          <div class="bg-gray-200 p-[10px] flex justify-end">
            <button
              onClick={handleApp}
              class="border border-gray-400 px-2 py-1 mr-1"
            >
              新增
            </button>
            <button
              onClick={handleDelete}
              class="border border-gray-400 px-2 p-1 mr-1"
            >
              删除
            </button>
            <button
              onClick={handleUp}
              class="border border-gray-400 px-2 p-1 mr-1"
            >
              上移
            </button>
            <button
              onClick={handleDown}
              class="border border-gray-400 px-2 p-1"
            >
              下移
            </button>
          </div>
          <div class="p-[10px]">{slots.default && slots.default()}</div>
        </div>
      )
    }
  },
})

export default defineComponent({
  name: 'ArrayField',
  props: FieldPropsDefine,
  setup(props) {
    const context = useCommonFieldContext()

    const handleArrayItemChange = (v: unknown, index: number) => {
      const { value } = props
      const arr = Array.isArray(value) ? value : []

      arr[index] = v

      props.onChange(arr)
    }

    const handleAdd = (index: number) => {
      const { value } = props
      const arr = Array.isArray(value) ? value : []

      arr.splice(index + 1, 0, undefined)

      props.onChange(arr)
    }

    const handleUp = (index: number) => {
      if (index === 0) return
      const { value } = props
      const arr = Array.isArray(value) ? value : []

      const item = arr.splice(index, 1)

      arr.splice(index - 1, 0, item[0])

      props.onChange(arr)
    }

    const handleDown = (index: number) => {
      const { value } = props
      const arr = Array.isArray(value) ? value : []

      if (index === arr.length - 1) return

      const item = arr.splice(index, 1)

      arr.splice(index + 1, 0, item[0])

      props.onChange(arr)
    }

    const handleDelete = (index: number) => {
      const { value } = props
      const arr = Array.isArray(value) ? value : []

      arr.splice(index, 1)

      props.onChange(arr)
    }

    const SelectionWidgetRef = getWidget(SelectionWidgetNames.SelectionWidget)

    return () => {
      const { SchemaItem } = context
      const { schema, rootSchema, value, errorSchema } = props
      const isMultiple = Array.isArray(schema.items)
      const isSelect = schema.items && (schema.items as Schema).enum
      const SelectionWidget = SelectionWidgetRef.value

      if (isMultiple) {
        // staticArray
        // {
        //   title: 'staticArray',
        //   type: 'array',
        //   items: [
        //     {
        //       title: 'staticArray1',
        //       type: 'string',
        //     },
        //     {
        //       title: 'staticArray2',
        //       type: 'number',
        //     },
        //   ],
        // }
        const items = schema.items as Schema[]
        const arr = Array.isArray(value) ? value : []

        return items.map((s: Schema, index: number) => (
          <SchemaItem
            schema={s}
            errorSchema={errorSchema[index] || {}}
            key={index}
            rootSchema={rootSchema}
            value={arr[index]}
            onChange={(v) => handleArrayItemChange(v, index)}
          />
        ))
      } else if (!isSelect) {
        // singleTypeArray: {
        //   title: 'singleTypeArray',
        //   type: 'array',
        //   items: {
        //     type: 'object',
        //     properties: {
        //       name: {
        //         title: 'singleTypeArray1',
        //         type: 'string',
        //       },
        //       age: {
        //         title: 'singleTypeArray2',
        //         type: 'number',
        //       },
        //     },
        //   },
        // }
        const arr = Array.isArray(value) ? value : []
        return arr.map((v: unknown, index: number) => (
          <ArrayItemWrapper
            index={index}
            onAdd={handleAdd}
            onDelete={handleDelete}
            onDown={handleDown}
            onUp={handleUp}
          >
            <SchemaItem
              schema={schema.items as Schema}
              key={index}
              rootSchema={rootSchema}
              errorSchema={errorSchema[index] || {}}
              value={v}
              onChange={(v) => handleArrayItemChange(v, index)}
            />
          </ArrayItemWrapper>
        ))
      } else {
        // multiSelectArray: {
        //   title: 'multiSelectArray',
        //   type: 'array',
        //   items: {
        //     type: 'string',
        //     enum: ['123', '456', '789'],
        //   },
        // }
        const enumOptions = (schema.items as Schema).enum
        const options = enumOptions!.map((e) => ({
          key: e as string,
          value: e,
        }))
        return (
          <SelectionWidget
            onChange={props.onChange}
            value={props.value}
            options={options}
            errors={errorSchema.__errors}
            schema={schema}
          />
        )
      }
    }
  },
})
