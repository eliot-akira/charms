import path from 'path'
import fs from 'fs'
import http from 'http'
import dotenv from 'dotenv'
import socketIo from 'socket.io'
import React from 'react'
import { send } from 'micro'
import { withHandlers, serveStatic, withMethod } from './utils'

import { createAuth } from './auth'
import { createContentApi } from './content'
import { createRenderer } from './render'
import { createApi, createApiRequestHandler } from './api'

import { provideRouteContext, withRoute } from './middlewares/route'
import { provideJsonData } from './middlewares/json'
import { provideJwtToken } from './middlewares/jwt'
import { provideUser } from './middlewares/user'
import { provideCookies } from './middlewares/cookies'

import { App, HttpServer, ServerProps } from './types'

// Shortcut for import React from 'react'
global.React = React

export async function createServer({
  App,
  storeProps,
  routes,
  socketPort: givenSocketPort,
  socketHandler,
  auth: authConfig,
  content: contentConfig,

  // react-builder replaces these env variables with literal strings in the app
  publicDir,      // path.resolve(path.join(__dirname, process.env.APP_PUBLIC_DIR))
  assets,         // require(process.env.APP_ASSETS_MANIFEST)
  chunksManifest  // require(process.env.APP_CHUNKS_MANIFEST)
}: ServerProps) {

  // Config

  const dotenvFiles = [
    `.env.${process.env.NODE_ENV}.local`,
    `.env.${process.env.NODE_ENV}`
  ]

  for (const dotenvFile of dotenvFiles) {
    if (!fs.existsSync(dotenvFile)) continue
    dotenv.config({
      path: dotenvFile
    })
    break
  }

  const appRoot = process.cwd()
  const port = (process.env.PORT && parseInt(process.env.PORT, 10)) || 3000
  const socketPort = givenSocketPort || port
  const isDev = process.env.NODE_ENV==='development'

  // Auth
  const auth = createAuth({
    tokenSecret: process.env.JWT_TOKEN_SECRET || 'temporary secret',
    expireDuration: 14 * 24 * 60 * 60, // Days in seconds
    ...(authConfig || {})
  })

  // Database
  const content = await createContentApi({
    dataPath: path.join(process.cwd(), 'data'),
    auth,
    ...(contentConfig || {})
  })

  // Route renderer
  const renderer = createRenderer({
    App,
    storeProps,
    assets,
    chunksManifest,
    isDev,

    auth,
    content
  })

  const api = createApi({
    auth,
    content
  })

  const apiRequestHandler = createApiRequestHandler({ api })

  // Server

  const app = withHandlers(
    provideRouteContext,

    withRoute('/.well-known')(
      serveStatic({
        public: path.join(publicDir, '.well-known'),
        ensureFileExtension: false
      })
    ),
    serveStatic(publicDir),

    provideCookies,
    provideJwtToken({ auth }),
    provideUser({ auth, content }),

    withMethod('get')(renderer),

    provideJsonData,
    withMethod('post')(
      withRoute('/api')(apiRequestHandler)
    ),
    (req, res) => {
      send(res, 404)
    }
  )

  // WebSocket

  app.connectSocketServer = async function(httpServer: HttpServer, previousApp = {}) {

    if (!socketHandler || !app) return

    const isDifferentPort = socketPort !== port

    const socketServer = isDifferentPort
      ? http.createServer()
      : httpServer

    if (previousApp.io) {
      previousApp.io.removeAllListeners() // Remove event handlers
    }

    const io = previousApp.io || socketIo(socketServer)
    app.io = io

    if (isDifferentPort) {
      socketServer.listen(socketPort)
    }

    app.closeSocketServer = () => new Promise((resolve, reject) => {
      if (isDifferentPort) {
        socketServer.close(resolve)
        return
      }
      resolve()
    })

    console.log(`WebSocket server listening at port ${socketPort}`)

    const socketContext = {
      auth,
      content
    }

    await socketHandler(io, socketContext)
  }

  app.port = port

  // Export

  if (process.env.APP_EXPORT) {
    require('@tangible/react-builder/export')({
      dest: publicDir,
      routes
    })
  }

  return app
}

export * from './types'
