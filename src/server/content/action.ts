import type {
  ActionCall,
  ActionData,
  ActionSuccess,
  ActionError,
  ActionContext,
  ActionCreatorProps,
} from './types'

export const contentTypeActionCreator = ({
  actionName,
  actionsConfig,
  actionCommonContext,
  allowAction,
  cleanResult,
  datastore
}: ActionCreatorProps): ActionCall => {

  const actionCallback = actionsConfig[actionName]
    ? (data: ActionData, context: ActionContext) => actionsConfig[actionName](data, context)
    // Default action
    : async (data: ActionData) => {
      try {
        return {
          result: await datastore[actionName](data)
        } as ActionSuccess
      } catch(e) {
        return {
          error: {
            message: e.message
          }
        } as ActionError
      }
    }

  const action: ActionCall = async (data, actionContext = {}) => {

    const context: ActionContext = {
      ...actionCommonContext,
      ...actionContext
    }

    // console.log('Call action', actionName, data)

    try {
      if (!context.isServer && !await allowAction(actionName, data, context)) {
        return { error: {
          status: 403,
          message: 'Forbidden'
        }}
      }

      const response = await actionCallback(data, context)

      // Clean

      let { result } = response as ActionSuccess

      if (cleanResult && result) {
        if (Array.isArray(result)) {
          const items: any[] = []
          for (const item of result) {
            items.push(cleanResult(actionName, item, context))
          }
          result = items
        } else {
          result = cleanResult(actionName, result, context)
        }
      }

      const { error } = response as ActionError

      // console.log('Action response', actionName, { result, error })

      return { result, error }

    } catch(e) {

      // console.error('Action error', e)

      return { error: {
        status: 500,
        message: e.message
      }}
    }
  }

  return action
}
