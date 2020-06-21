import type { Actions } from 'medux'

export { createStore } from 'medux'
export { useStore } from 'medux/react'
export type { Store, Actions } from 'medux'

// API

const guestUser = {
  _id: 0,
  name: ''
}

export const createState = () => ({
  content: {

  },
  user: guestUser,
  userErrorMessage: ''
})

export const actions: Actions = {

  async login(data) {

    const { api } = this.context
    const { state } = this

    const {
      result,
      error
    } = await api({
      type: 'user',
      action: 'login',
      data
    })

    if (result && result.user) {
      this.setState({
        user: result.user,
        userErrorMessage: ''
      })
      return
    }

    this.setState({
      userErrorMessage: (error && error.messsage) || 'Login failed'
    })

  },

  async logout() {

    const { api } = this.context
    const { state } = this

    const {
      result,
      error
    } = await api({
      type: 'user',
      action: 'logout'
    })

    if (result) {
      this.setState({
        user: guestUser,
        userErrorMessage: ''
      })
      return
    }

    this.setState({
      userErrorMessage: (error && error.messsage) || 'Logout failed'
    })
  }
}
