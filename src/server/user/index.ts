import { Actions } from '../content'
import * as actions from './actions'
import { cleanUser, isAdmin } from './utils'
import type { ContentTypeConfig } from '../content/types'

export const guestUser = {
  _id: 0,
  roles: []
}

export const allowAction = (actionName, data = {}, context) => {

  const {
    user = guestUser
  } = context

  const isSelf = user._id===data._id || user.name===data.name

  switch (actionName) {
  // Admin or self
  case 'find':
  case 'findOne':
  case 'update':
    return isAdmin(user) || isSelf
  // Admin
  case 'insert':
  case 'remove':
    return isAdmin(user)
  case 'login':
  case 'register':
    return !user._id
  case 'logout':
    return !!user._id
  }

  return false
}

export const cleanResult = (actionName, result, context) => {
  return cleanUser(result)
}

const defaultItems = [
  {
    name: 'admin',
    password: 'admin',
    roles: ['admin']
  }
]

export const userTypeConfig: ContentTypeConfig = {
  ensureIndex: [
    'name'
  ],
  defaultItems,
  actions,
  allowAction,
  cleanResult
}