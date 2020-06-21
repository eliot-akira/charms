import {
  Request,
  Response
} from './types'
import { request } from 'http'
import { send } from 'micro'
import { responseSent } from './utils'

export function createApi({
  auth,
  content
}) {

  // Wrapper to Content API

  return async function api(apiRequest, apiContext) {

    // console.log('API request', apiRequest)

    const {
      type = 'action',
      action,
      data = {}
    } = apiRequest

    if (!action) throw { message: 'Property action is required' }

    if (!content.types[type]) throw { message: `Unknown type ${type}` }
    if (!content.types[type][action]) throw { message: `Unknown action ${action} for type ${type}` }

    const apiResponse = await content.types[type][action](data, apiContext)

    // console.log('API response', apiResponse)

    return apiResponse
  }
}

export function createApiRequestHandler({
  api
}) {

  // Wrapper to handle API actions via HTTP
  return async function(req: Request, res: Response) {

    if (req.jsonError) {
      send(res, 401, { error: {
        message: req.jsonError
      } })
      return
    }

    const {
      type,
      action,
      data
    } = req.json && typeof req.json==='object'
      ? req.json
      : {}

    const user = req.user
    const apiRequest = {
      type,
      action,
      data
    }
    const apiContext = {
      user,
      req, res,
      isServer: false, // Handle as client request, with permissions check
    }

    try {
      const {
        result,
        error
      } = await api(apiRequest, apiContext)

      if (error) throw error
      if (responseSent(res)) return

      send(res, 200, { result })

    } catch(error) {

      if (responseSent(res)) return

      const {
        status,
        message
      } = typeof error.message==='object' ? error.message : error

      send(res, status || 401, { error: {
        status, message
      } })
    }
  }
}