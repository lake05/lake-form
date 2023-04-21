<script setup lang="ts">
import { reactive, ref, watchEffect } from 'vue'
// import TestView from './TestView.vue'
import MonacoEditor from './components/MonacoEditor'
import SchemaForm from '../lib'
// 这些是 json.schema 的例子（其中的结构也是有固定的结构的）
import demos from './demos'
import { Schema, UISchema } from '../lib/types'
import themeDefault from '../lib/theme-default'
import ThemeProvider from '../lib/theme'
import { SchemaFormRef } from '../lib/SchemaForm'

const selectedRef = ref<number>(0)

const demo: {
  // schema data uiSchema 对应了三个编辑器（对象）
  // schemaCode dataCode uiSchemaCode 对应的编辑器的内容 JSON 化之后的数据（字符串）
  schema: Schema | null
  data: unknown
  uiSchema: UISchema | null
  schemaCode: string
  dataCode: string
  uiSchemaCode: string
  customValidate: ((data: any, error: any) => void) | undefined
} = reactive({
  schema: null,
  data: {},
  uiSchema: {},
  schemaCode: '',
  dataCode: '',
  uiSchemaCode: '',
  customValidate: undefined,
})
watchEffect(() => {
  const index = selectedRef.value
  const d: any = demos[index]
  demo.schema = d.schema
  demo.data = d.default
  demo.uiSchema = d.uiSchema
  demo.schemaCode = toJson(d.schema)
  demo.dataCode = toJson(d.default)
  demo.uiSchemaCode = toJson(d.uiSchema)
  demo.customValidate = d.customValidate
})

function toJson(data: unknown) {
  return JSON.stringify(data, null, 2)
}

// 代码编辑器一旦被触发，同是如果数据发生了变化
function handleCodeChange(
  filed: 'schema' | 'data' | 'uiSchema',
  value: string
) {
  try {
    const json = JSON.parse(value)
    demo[filed] = json
    demo[`${filed}Code`] = value
  } catch (err) {
    // some thing
  }
}

const handleSchemaChange = (v: string) => handleCodeChange('schema', v)
const handleDataChange = (v: string) => handleCodeChange('data', v)
const handleUISchemaChange = (v: string) => handleCodeChange('uiSchema', v)

const handleChange = (v: unknown) => {
  demo.data = v
  demo.dataCode = toJson(v)
}
const schemaFormRef = ref<SchemaFormRef | null>(null)

const validateForm = () => {
  const validate = schemaFormRef.value?.doValidate().then((result) => {
    console.log('result: ', result)
  })
}
</script>

<template>
  <div class="container flex flex-col h-screen my-0 mx-auto">
    <h1 class="text-xl font-bold my-2">Vue3 JsonSchema Form</h1>
    <div>
      <button
        v-for="(item, index) in demos"
        :key="item.name"
        class="px-3 py-1 m-1 bg-slate-300 border rounded hover:bg-blue-400 hover:text-white"
        :class="{ 'bg-blue-400 text-white': index === selectedRef }"
        @click="selectedRef = index"
      >
        {{ item.name }}
      </button>
    </div>

    <div class="flex justify-between">
      <div class="w-2/4 mr-2">
        <div class="grid grid-cols-2 gap-4">
          <MonacoEditor
            class="h-96 col-span-2"
            title="Schema"
            :code="demo.schemaCode"
            :on-change="handleSchemaChange"
          >
            <template #header>
              <div class="bg-pink-400 p-2">title</div></template
            >
          </MonacoEditor>
          <MonacoEditor
            class="h-96"
            title="UISchema"
            :code="demo.uiSchemaCode"
            :on-change="handleUISchemaChange"
          />
          <MonacoEditor
            class="h-96"
            title="Value"
            :code="demo.dataCode"
            :on-change="handleDataChange"
          />
        </div>
      </div>
      <div class="w-2/4 ml-2">
        <ThemeProvider :theme="themeDefault">
          <SchemaForm
            ref="schemaFormRef"
            :schema="demo.schema!"
            :on-change="handleChange"
            :value="demo.data"
            :custom-validate="demo.customValidate"
          />
        </ThemeProvider>

        <button
          class="px-3 py-1 m-1 bg-slate-300 border rounded hover:bg-blue-400 hover:text-white"
          @click="validateForm"
        >
          校验
        </button>
      </div>
    </div>
  </div>
</template>
