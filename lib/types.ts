import { FormatDefinition } from 'ajv/dist/types'
import { DefineComponent, PropType } from 'vue'
import { ErrorSchema } from './validator'
import SelectionWidget from './widgets/Selection'

// 会把一些通用的类型统一放在这个 ts 文件里面
export enum SchemaTypes {
  'NUMBER' = 'number',
  'INTEGER' = 'integer',
  'STRING' = 'string',
  'OBJECT' = 'object',
  'ARRAY' = 'array',
  'BOOLEAN' = 'boolean',
}

// 这里的 schema 可以做一些预先定义，通过 $ref 来去引用这个部分的 schema
type SchemaRef = { $ref: string }

export interface Schema {
  // 这里加 string 类型的原因是因为后面再写的时候，除了写成 SchemaTypes.NUMBER 还可以直接写 string
  type?: SchemaTypes | string
  const?: unknown
  format?: string

  title?: string
  default?: unknown

  properties?: {
    [key: string]: Schema
  }
  items?: Schema | Schema[] | SchemaRef
  uniqueItems?: unknown
  dependencies?: {
    [key: string]: string[] | Schema | SchemaRef
  }
  oneOf?: Schema[]
  unknownOf?: Schema[]
  allOf?: Schema[]
  required?: string[]
  enum?: (string | number)[]
  enumNames?: unknown[]
  enumKeyValue?: unknown[]
  additionalProperties?: unknown
  additionalItems?: Schema

  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  multipleOf?: number
  exclusiveMaximum?: number
  exclusiveMinimum?: number
}

export const FieldPropsDefine = {
  schema: {
    type: Object as PropType<Schema>,
    required: true,
  },
  rootSchema: {
    type: Object as PropType<Schema>,
    required: true,
  },
  value: {
    required: true,
  },
  onChange: {
    type: Function as PropType<(v: unknown) => void>,
    required: true,
  },
  errorSchema: {
    type: Object as PropType<ErrorSchema>,
    required: true,
  },
  // uiSchema: {
  //   type: Object as PropType<UISchema>,
  //   required: true,
  // },
} as const

export type CustomValidate = (data: any, errors: any) => void

export type CommonFieldType = DefineComponent<typeof FieldPropsDefine>

export const CommonWidgetPropsDefine = {
  value: {},
  onChange: {
    type: Function as PropType<(v: unknown) => void>,
    required: true,
  },
  errors: {
    type: Array as PropType<string[]>,
  },
  schema: {
    type: Object as PropType<Schema>,
    required: true,
  },
  // options: {
  //   type: Object as PropType<{ [key: string]: unknown }>,
  // },
} as const

export const SelectionWidgetPropsDefine = {
  ...CommonWidgetPropsDefine,
  options: {
    type: Array as PropType<
      {
        key: string
        value: unknown
      }[]
    >,
    required: true,
  },
} as const

export type CommonWidgetDefine = DefineComponent<typeof CommonWidgetPropsDefine>
export type SelectionWidgetDefine = DefineComponent<
  typeof SelectionWidgetPropsDefine
>

export enum SelectionWidgetNames {
  SelectionWidget = 'SelectionWidget',
}

export enum CommonWidgetNames {
  TextWidget = 'TextWidget',
  NumberWidget = 'NumberWidget',
}

export interface Theme {
  widgets: {
    [SelectionWidgetNames.SelectionWidget]: SelectionWidgetDefine
    [CommonWidgetNames.TextWidget]: CommonWidgetDefine
    [CommonWidgetNames.NumberWidget]: CommonWidgetDefine
  }
}

export type UISchema = {
  widget?: string | CommonWidgetDefine
  properties?: {
    [key: string]: UISchema
  }
  items?: UISchema | UISchema[]
} & {
  [key: string]: unknown // w: 开头
}

export interface CustomFormat {
  name: string
  definition: FormatDefinition<string | number>
  component: CommonWidgetDefine
}

interface VjsfKeywordDefinition {
  type?: string | Array<string>
  async?: boolean
  $data?: boolean
  errors?: boolean | string
  metaSchema?: unknown
  // schema: false makes validate not to expect schema (ValidateFunction)
  schema?: boolean
  statements?: boolean
  dependencies?: Array<string>
  modifying?: boolean
  valid?: boolean
  // one and only one of the following properties should be present
  macro: (
    schema: unknown,
    parentSchema: unknown,
    it: unknown
  ) => unknown | boolean
}

export interface CustomKeyword {
  name: string
  deinition: VjsfKeywordDefinition
  transformSchema: (originSchema: Schema) => Schema
}

export type Language =
  | 'en'
  | 'ar'
  | 'ca'
  | 'cs'
  | 'de'
  | 'es'
  | 'fi'
  | 'fr'
  | 'hu'
  | 'id'
  | 'it'
  | 'ja'
  | 'ko'
  | 'nb'
  | 'nl'
  | 'pl'
  | 'pt-BR'
  | 'ru'
  | 'sk'
  | 'sv'
  | 'th'
  | 'zh'
  | 'zh-TW'
