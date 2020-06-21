import type { RequestHandler } from '../types'
import type { Auth } from '../auth'
import type { ContentApi } from '../content/types'

export const provideUser = ({
  auth, content
}: {
  auth: Auth,
  content: ContentApi
}): RequestHandler => async (req, res) => {

  // JWT token from Authorization Bearer or cookie
  const token = req.jwt
    || (req.cookies && req.cookies.jwt)

  if (!token) return

  try {
    const {
      sub: _id
    } = await auth.decodeToken(token)

    if (!_id) return

    const {
      result,
      error
    } = await content.types.user.findOne({ _id })

    if (error || !result) return

    req.user = result

  } catch(e) { /**/ }
}
