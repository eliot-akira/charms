import http from 'http'

let httpServer
let currentApp

// Manage process events

const closeServer = () => {
  try {
    if (httpServer) {
      httpServer.close()
      if (currentApp && currentApp.closeSocketServer) {
        currentApp.closeSocketServer()
      }
    }
    httpServer = null
    currentApp = null
  } catch(e) {
    console.error('Server error on shutdown', e)
  }
}

const onExit = () => {
  closeServer()
  process.exit(0)
}

const onError = () => {
  closeServer()
  process.exit(1)
}

process.on('SIGINT', onExit)
process.on('SIGTERM', onExit)
process.on('exit', onExit)
process.on('uncaughtException', (err) => {
  console.error('Server uncaught exception', err)
  onError()
})
process.on('unhandledRejection', (reason, p) => {
  console.error('Server unhandled rejection', p)
  onError()
})

export const startServer = props => {

  const serverProimse = props.default || props

  serverProimse.then(app => {

    currentApp = app
    httpServer = http.createServer(currentApp)

    const {
      port
    } = app

    httpServer
      .listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`)
      })
      .on('error', error => {
        console.log(error)
      })

    app.connectSocketServer(httpServer)
  })
}

export const reloadServer = props => {

  /**
   * Server-side hot-module replacement
   *
   * Reuse HTTP server instance, and restart WebSocket server.
   */

  const serverProimse = props.default || props

  console.log('Reloading server..')

  serverProimse.then(async app => {

    // TODO: Remove old socket server handler and attach new one
    if (currentApp.closeSocketServer) {
      await currentApp.closeSocketServer()
    }

    // Remove listeners including any WebSocket server on same port
    httpServer.removeAllListeners('request')
    httpServer.on('request', app)

    app.connectSocketServer(httpServer, currentApp)

    currentApp = app
  })
}
