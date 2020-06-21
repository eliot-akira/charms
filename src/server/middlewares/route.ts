import { parse as parseUrl, URL } from 'url'
import { parse as parsePath } from 'path'
import { Request } from '../types'

export const stripEndSlash = c => (c!=='/' && c[c.length - 1]==='/') ? c.slice(0, -1) : c

export type RouteContext = {
  site: string
  port: number
  path: string
  query: {
    [key: string]: string | string[] | undefined
  } // ParsedUrlQuery
  file: {
    dir: string,
    root: string,
    base: string,
    name: string,
    ext: string
  }
}

export const getRouteContext = (req): RouteContext => {

  const { pathname, query } = parseUrl(req.url, true)
  const path = stripEndSlash(pathname)

  const [site, port] = req.headers.host.split(':') // Without protocol

  return {
    site,
    port: parseInt(port),
    path,
    query,
    file: parsePath(path)
    //https: req.connection.encrypted ? true : false,
  }
}

export const provideRouteContext = (req: Request, res) => {
  req.route = getRouteContext(req)
}

export const withRoute = (routePath: string) => fn => (req, res) => {

  const parts: string[] = req.route.path.split('/')
  const checks: string[] = routePath.split('/')

  for (const part of parts) {

    const check = checks.shift()

    // TODO: Wildcards * or **

    if (check !== part) return
  }

  if (checks.length) return

  return fn(req, res)
}
