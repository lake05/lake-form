import { defineComponent, h } from 'vue'
import img from '../assets/vue.svg'

export default defineComponent({
  // setup只执行一次
  setup(props, ctx) {
    return () => {
      // upload
      return h('div', { id: 'image' }, [
        h('img', { src: img, alt: 'VUE LOGO' }),
      ])
    }
  },
})
