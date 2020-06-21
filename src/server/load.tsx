import { Component } from 'react'
import { withRouter } from 'react-router'

// Server-side load
// export const Test = load('Test', require('./pages/Test'))

export default function load(name, Loaded) {

  const C = Loaded.default || Loaded

  const SyncComponent = withRouter(props => {

    // Pass rendered component names to server, which preloads
    // the chunks, as well as passing them to client

    const { staticContext } = props

    if (staticContext && staticContext.splitPoints) {
      staticContext.splitPoints.push(name)
    }

    return <C {...props} />
  })

  return SyncComponent
}
