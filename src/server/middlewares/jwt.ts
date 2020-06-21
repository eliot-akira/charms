import type { RequestHandler } from '../types'
import type { Auth } from '../auth'
import { decodeToken } from '../auth/jwt'

export const provideJwtToken = ({
  auth
}: { auth: Auth }): RequestHandler => async (req, res) => {

  const prefix = 'Bearer '
  const token =
    (req.headers.authorization
      && req.headers.authorization.slice(0, prefix.length)===prefix
    ) ? req.headers.authorization.replace(prefix, '')
      : ''

  if (!token) {
    req.jwtError = {
      message: 'Missing authorization header'
    }
    return
  }

  Object.assign(req, await decodeToken(req.auth, token)) // { jwt, jwtError }
}
