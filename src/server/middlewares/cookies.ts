import { parse as parseCookie } from 'cookie'
import type { RequestHandler } from '../types'

export const provideCookies: RequestHandler = (req, res) => {
  req.cookies = parseCookie((req.headers && req.headers.cookie) || '')
}