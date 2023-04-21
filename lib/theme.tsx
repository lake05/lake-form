import {
  computed,
  defineComponent,
  inject,
  InjectionKey,
  PropType,
  provide,
  ComputedRef,
  readonly,
} from 'vue'
import { CommonWidgetNames, SelectionWidgetNames, Theme } from './types'

const THEME_PROVIDER_KEY = Symbol() as InjectionKey<ComputedRef<Theme>>

const ThemeProvider = defineComponent({
  name: 'ThemeProvider',
  props: {
    theme: {
      type: Object as PropType<Theme>,
      required: true,
    },
  },

  setup(props, { slots }) {
    const context = computed(() => props.theme)

    provide(THEME_PROVIDER_KEY, readonly(context))

    return () => slots.default && slots.default()
  },
})

export function getWidget<T extends SelectionWidgetNames | CommonWidgetNames>(
  name: T
) {
  const context = inject(THEME_PROVIDER_KEY)

  if (!context) {
    throw new Error('provide theme required')
  }

  const widgetRef = computed(() => context.value.widgets[name])

  return widgetRef
}

export default ThemeProvider
