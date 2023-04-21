import {
  defineComponent,
  onMounted,
  watch,
  ref,
  onBeforeUnmount,
  PropType,
  shallowRef,
} from 'vue'

import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
  getWorker(_: unknown, label: string) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  },
}

export default defineComponent({
  props: {
    code: {
      type: String as PropType<string>,
      required: true,
    },
    onChange: {
      type: Function as PropType<
        (value: string, event?: monaco.editor.IModelContentChangedEvent) => void
      >,
      required: true,
    },
    title: {
      type: String as PropType<string>,
      default: '',
    },
  },

  setup(props, { slots }) {
    const editorRef = shallowRef()

    const containerRef = ref<HTMLInputElement | null>(null)

    let _subscription: monaco.IDisposable | undefined
    let __prevent_trigger_change_event = false

    onMounted(() => {
      if (!containerRef.value) return

      const editor = (editorRef.value = monaco.editor.create(
        containerRef.value,
        {
          value: props.code,
          language: 'json',
          formatOnPaste: true,
          tabSize: 2,
          minimap: {
            enabled: false,
          },
        }
      ))

      // 会根据这个代码的内容的变化而实时的去返回给我们使用这个组件
      _subscription = editor.onDidChangeModelContent(
        (event: monaco.editor.IModelContentChangedEvent) => {
          if (!__prevent_trigger_change_event) {
            props.onChange(editor.getValue(), event)
          }
        }
      )
    })

    onBeforeUnmount(() => {
      if (_subscription) _subscription.dispose()
    })

    watch(
      () => props.code,
      (v) => {
        const model = editorRef.value.getModel()
        if (v !== model.getValue()) {
          editorRef.value.pushUndoStop()
          __prevent_trigger_change_event = true
          // pushEditOperations says it expects a cursorComputer, but doesn't seem to need one.
          model.pushEditOperations(
            [],
            [
              {
                range: model.getFullModelRange(),
                text: v,
              },
            ]
          )
          editorRef.value.pushUndoStop()
          __prevent_trigger_change_event = false
        }
      }
    )

    return () => {
      return (
        <div class="flex flex-col border border-gray-500 rounded overflow-hidden">
          {slots.header ? (
            slots.header?.(props.title)
          ) : props.title ? (
            <div class="bg-gray-300 py-3 pl-5">{props.title}</div>
          ) : null}

          <div class="grow" ref={containerRef}></div>
        </div>
      )
    }
  },
})
