export const decodeToken = async (auth, token) => {

  let jwt, jwtError

  if (!token) {

    jwtError = { message: 'Missing token' }

  } else {
    try {

      // decodeToken throws when expired
      jwt = await auth.decodeToken(token)

      if (!jwt) {
        jwtError = { message: 'Invalid token' }
      }

    } catch (e) {
      jwtError = {
        message: e.message || 'Expired token'
      }
    }
  }

  return {
    jwt,
    jwtError
  }
}