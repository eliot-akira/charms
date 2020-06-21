import bcrypt from 'bcryptjs'
import * as jwt from 'jwt-simple'
import { promisify } from 'util'

const compare = promisify(bcrypt.compare)
const genSalt = promisify(bcrypt.genSalt)
const hash = promisify(bcrypt.hash)

async function compareHash(password, hashed) {
  return await compare(password, hashed)
}
async function createHash(password) {
  return await hash(password, await genSalt())
}

function isTokenExpired(token) {
  const now = Date.now() / 1000
  return now > token.exp
}

export type AuthConfig = {
  tokenSecret?: string,
  expireDuration?: number
}

/**
 * Authentication utilities
 */
export type Auth = {
  createHash: (password: string) => Promise<string>
  compareHash: (password: string, hashed: string) => Promise<boolean>
  isTokenExpired: (token: string) => boolean
  decodeToken: (token:string) => Promise<any>
  encodeToken: (id: string, extra?: { [key: string]: any }) => Promise<string>
}

export function createAuth(config: AuthConfig): Auth {

  const {
    tokenSecret = process.env.JWT_TOKEN_SECRET || (() => {
      throw new Error('Token secret is required: define environment variable JWT_TOKEN_SECRET')
    })(),
    expireDuration = 14 * 24 * 60 * 60 // 14 days in seconds
  } = config

  return {

    createHash,
    compareHash,
    isTokenExpired,

    async encodeToken(id, extra = {}) {
      const now = Date.now() / 1000
      const payload = {
        sub: id, // Subject
        iat: now,
        exp: now + expireDuration,
        ...extra
      }
      return jwt.encode(payload, tokenSecret)
    },

    async decodeToken(token) {
      return jwt.decode(token, tokenSecret)
    }
  }
}
