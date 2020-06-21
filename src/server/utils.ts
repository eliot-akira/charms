import { IncomingMessage, ServerResponse } from 'http'
import serveHandler from 'serve-handler'

export type Request = IncomingMessage & { [key: string]: any }
export type RequestHandler = (req: Request, res: ServerResponse) => void | Promise<void>

export const responseSent = (res: ServerResponse) => res.headersSent || res.writableEnded

export const withHandlers = (...handlers): RequestHandler => async (req, res) => {
  for (const fn of handlers) {
    try {
      const result = await fn(req, res)
      if (result || responseSent(res)) return result
    } catch(e) {
      console.error('Handler error:', e.message, fn, e.stack)
    }
  }
}

export const withMethod = method => {
  const methodName = method.toUpperCase()
  return (fn: RequestHandler): RequestHandler => (req, res) => {
    if (req.method !== methodName) return
    return fn(req, res)
  }
}

export const withMethods = (...methods) => {
  const methodNames = methods.map(m => m.toUpperCase())
  return (fn: RequestHandler): RequestHandler => (req, res) => {
    if (methodNames.indexOf(req.method) < 0) return
    return fn(req, res)
  }
}

// Static file server

const serveStaticDefaultOptions = {
  public: '.',
  symlinks: true,
  directoryListing: false
}

export const serveStatic = (options = {} as any) => {

  if (typeof options==='string') {
    options = { public: options }
  }

  const {
    index = false,
    ensureFileExtension = true,
    ...serveHandlerOptions
  } = options

  return withMethod('get')(async (req, res) => {

    if (!index && ensureFileExtension && !req.route.file.ext) return

    await serveHandler(req, res, {
      ...serveStaticDefaultOptions,
      ...serveHandlerOptions,
    })
  })
}
