export default {
  name: 'Demo',
  schema: {
    type: 'object',
    required: ['pass1', 'pass2'],
    properties: {
      pass1: {
        type: 'string',
        minLength: 6,
        title: 'password',
      },
      pass2: {
        type: 'string',
        minLength: 6,
        title: 'retry password',
      },
    },
  },
  customValidate: async (data: any, error: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (data.pass1 !== data.pass2) {
          error.pass2.addError('密码必须相同')
        }
        resolve(null)
      }, 2000)
    })
  },
  uiSchema: {},
  default: {},
}
