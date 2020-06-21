import type { Request, Response } from '../types'
import type { Datastore, EnsureIndexOptions, Document } from '../database'
import type { Auth } from '../auth'

export type { Datastore }

export type ContentConfig = {
  dataPath: string,
  types?: ContentTypeConfigs,
  auth: Auth,
  context?: ContentContext
}

export type ContentContext = {
  [key: string]: any
}

export type ContentTypeConfig = {
  name?: string,
  actions?: Actions,
  allowAction: AllowAction,
  cleanResult?: CleanResult,
  defaultItems?: any[],
  ensureIndex?: (EnsureIndexOptions | string)[]
}

export type ContentTypeConfigs = {
  [key: string]: ContentTypeConfig
}

export type AllowAction = (name: string, data: ActionData, context: ActionContext) => boolean | Promise<boolean>
export type CleanResult = (name: string, result: any, context: ActionContext) => any

export type ContentType = {
  datastore: Datastore
} & ActionCalls

export type ContentTypes = {
  [key: string]: ContentType
}

export type ContentTypeCreator = (typeConfig: ContentTypeConfig) => Promise<ContentType>
export type ContentTypeCreatorProps = ContentConfig & {
  contentContext: ContentContext,
  contentTypes: ContentTypes
}

export type ContentApi = {
  types: ContentTypes,
  createType: ContentTypeCreator,
  removeType: (typeName: string) => void
}

// Action

export type ActionContext = {
  auth: Auth,
  content: ContentApi,
  datastore?: Datastore,
  user?: any,
  isServer?: boolean,
  req?: Request,
  res?: Response,
  [key: string]: any
}

export type Action = (
  actionData: ActionData,
  context: ActionContext
) => ActionResult

export type Actions = {
  [key: string]: Action
}

export type ActionData = {
  [key: string]: any
}

export type ActionResult = Promise<ActionSuccess | ActionError>

export type ActionSuccess = {
  result: any
}

export type ActionError = {
  error: {
    status?: number,
    message: string
  }
}

// Action call with optional context

export type ActionCall = (
  actionData: ActionData,
  context?: {
    [key: string]: any
  }
) => ActionResult

export type ActionCalls = {
  [key: string]: ActionCall
}

// Action creator

export type ActionCreatorProps = {
  actionName: string,
  actionsConfig: Actions,
  actionCommonContext: ActionContext,
  allowAction: AllowAction,
  cleanResult?: CleanResult,
  datastore: Datastore
}
