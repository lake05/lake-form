import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const number = 12
    return () => (
      <div id="component" className="border-y-indigo-50">
        <img src="../assets/vue.svg" alt="" />
        <p>{number}</p>
      </div>
    )
  },
})
