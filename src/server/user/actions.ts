import { serialize as makeCookie } from 'cookie'
import { withHashedPassword, isAdmin } from './utils'
import { Action } from '../content'

export const find: Action = async function(data, context) {
  const { datastore } = context
  return {
    result: await datastore.find(data)
  }
}

export const findOne: Action = async function(data, context) {
  const { datastore } = context
  return {
    result: await datastore.findOne(data)
  }
}

export const insert: Action = async function(data, context) {

  const {
    name,
    password,
    roles
  } = data

  const {
    datastore,
    isServer,
    user
  } = context

  if (!password || !name) {
    return { error: {
      status: 401,
      message: 'Name and password required'
    } }
  }

  // Check exising user name

  if (await datastore.findOne({ name })) {
    return { error: {
      status: 401,
      message: 'Name exists'
    } }
  }

  if (!isServer && !isAdmin(user)) return { error: {
    status: 401,
    message: 'Must be admin to create user'
  } }

  const result = await datastore.insert({
    ...(await withHashedPassword(data, context)),
    roles
  })

  return { result }
}

export const update: Action = async function(data, context) {

  const { datastore } = context

  const {
    name,
    _id,
    ...saveData
  } = data

  const query = name ? { name } : { _id }
  const result = await datastore.update(query,
    await withHashedPassword(saveData, context)
  )

  return { result }
}

export const login: Action = async function(data, context) {

  const {
    name,
    password,
  } = data

  const {
    datastore,
    auth,
    isServer,
    mode = 'cookie', // or 'jwt' for auth action
    req, res,
    user
  } = context

  if (!password || !name) return {
    error: {
      status: 401,
      message: 'Name and password required'
    }
  }

  if (user && user._id) return {
    error: {
      status: 401,
      message: 'Already logged in'
    }
  }

  const foundUser = await datastore.findOne({ name })

  if (!foundUser) return {
    error: {
      status: 401,
      message: 'User not found'
    }
  }

  const {
    hashedPassword,
    ...userData
  } = foundUser

  const isValidPassword = hashedPassword
    && await auth.compareHash(password, hashedPassword)

  if (!isValidPassword) return {
    error: {
      status: 401,
      message: 'Invalid password'
    }
  }

  // Set cookie or return JWT token

  const token = await auth.encodeToken(userData._id)

  const result = {
    user: userData,
    message: 'Login success'
  }

  if (mode==='cookie' && req && res) {

    const {
      site
    } = req.route

    // Cookie - See: https://github.com/jshttp/cookie
    res.setHeader('Set-Cookie', makeCookie('jwt', token, {
      path: '/', // Important: for the whole domain
      maxAge: 14 * 24 * 60 * 60, // 14 days in seconds
      domain: site,
      sameSite: 'strict', // No third-party
      //req.headers.origin || '', // Enable for subdomains
      //httpOnly: true, // Also prevents client-side delete
      //secure: true, // Requires HTTPS
    }))

    // No token returned

  } else {
    // Token for external API
    result.token = token
  }

  return { result }
}

export const logout: Action = async function(data, context) {

  const {
    req,
    res,
    mode = 'cookie'
  } = context

  if (mode==='cookie' && req && res) {

    const {
      site
    } = req.route

    // Clear cookie
    res.setHeader('Set-Cookie', makeCookie('jwt', '', {
      path: '/',
      maxAge: 0,
      domain: site,
      sameSite: 'strict'
    }))
  }

  return { result: {
    message: 'Logout success'
  } }
}

export const register: Action = async function(data, context) {
  return { result: 'registered user' }
}
