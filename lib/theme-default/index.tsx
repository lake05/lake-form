import { markRaw } from 'vue'
import SelectionWidget from './SelectionWidget'
import TextWidget from './TextWidget'
import NumWidget from './NumWidget'

import { CommonWidgetDefine, SelectionWidgetDefine, Theme } from '../types'

const theme: Theme = {
  widgets: {
    SelectionWidget: markRaw(SelectionWidget) as SelectionWidgetDefine,
    NumberWidget: markRaw(NumWidget) as CommonWidgetDefine,
    TextWidget: markRaw(TextWidget) as CommonWidgetDefine,
  },
}

export default theme
