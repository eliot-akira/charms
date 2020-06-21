import type {
  Server as HttpServer,
  IncomingMessage
} from 'http'
import type {
  Response,
  Application
} from 'express'
import type { ReactNode } from 'react'
import type { StoreCreatorProps } from 'medux'
import type { AuthConfig } from './auth'
import type { ContentConfig } from './content'


export type ServerProps = {
  App: ReactNode,
  storeProps: StoreCreatorProps,
  routes: RouteDefinition[],

  socketPort?: number,
  socketHandler?: (io: any, context: any) => void,

  auth?: AuthConfig,
  content?: ContentConfig,

  // react-builder replaces these env variables with literal strings in the app
  publicDir: string, // path.resolve(path.join(__dirname, process.env.APP_PUBLIC_DIR))
  assets: { [key: string]: any }, // require(process.env.APP_ASSETS_MANIFEST)
  chunksManifest: { [key: string]: any } // require(process.env.APP_CHUNKS_MANIFEST)
}

type RouteDefinition = any // TODO

export type App = Application & {
  shutdown?: () => void,
  closeSocketServer?: () => void,
  port?: number,
  socketServer?: HttpServer,
  connectSocketServer?: (httpServer: HttpServer) => void
}

export type { HttpServer, Response }
export type Request = IncomingMessage & { [key: string]: any }
export type RequestHandler = (req: Request, res: Response, next: () => void) => void | Promise<void>

export * from './auth'
export * from './database'
export * from './content/types'
