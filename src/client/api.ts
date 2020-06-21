import createFetch from 'fetch-ponyfill'

let fetch

export function createApi(props = {}) {

  const {
    url = '/api',
  } = props

  return async function api({
    type,
    action,
    data,
    token
  }) {

    if (!fetch) fetch = createFetch().fetch

    const body = JSON.stringify({
      type,
      action,
      data
    })

    const headers = {
      'content-type': 'application/json'
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
    })

    try {
      // TODO: Check range
      if (response.status === 200) {
        return await response.json()
      }

      let message
      try {
        message = await response.text()
        message = JSON.parse(message)
      } catch(e) { /**/ }
      return { error: typeof message==='object'
        ? message
        : {
          status: response.status,
          message: message || response.statusText
        } }
    } catch(error) {
      return { error }
    }
  }
}
