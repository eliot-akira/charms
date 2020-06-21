import { send, json } from 'micro'

export const provideJsonData = async (req, res) => {

  try {
    req.json = await json(req)
  } catch(e) {
    // Ignore error for now - route may not require data
    req.jsonError = e.message
  }
}

export const ensureJsonData = async (req, res) => {
  if (req.json) return true
  send(res, 500, { message: 'Bad request', error: req.jsonError })
  return false
}
