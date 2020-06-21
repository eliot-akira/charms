import path from 'path'
import fs from 'fs-extra'
import { Datastore } from '../database'
import { contentTypeActionCreator } from './action'
import type {
  ContentTypeConfig,
  ContentType,
  ContentTypeCreator,
  ContentTypeCreatorProps
} from './types'

export const contentTypeCreator = ({
  auth,
  dataPath,
  contentContext,
  contentTypes
}: ContentTypeCreatorProps): ContentTypeCreator => async function(
  typeConfig: ContentTypeConfig
): Promise<ContentType> {

  const {
    name: typeName,
    actions: actionsConfig = {},
    defaultItems,
    ensureIndex,
    allowAction = () => false,
    cleanResult,
  } = typeConfig

  const filename = path.join(dataPath, `${typeName}.db`)

  // Ensure data path
  await fs.ensureDir(path.dirname(filename))

  /**
   * Document database
   *
   * @see https://github.com/bajankristof/nedb-promises
   * @see https://github.com/louischatriot/nedb
   */
  const datastore = Datastore.create({
    filename,
    autoload: true
  })

  if (ensureIndex) {
    for (const indexConfig of ensureIndex) {
      await datastore.ensureIndex(
        typeof indexConfig==='string'
          ? { fieldName: indexConfig }
          : indexConfig
      )
    }
  }

  const contentType = {
    datastore
  } as ContentType

  const actionCommonContext = {
    ...contentContext,
    auth,
    datastore,
    isServer: true // Pass false for external request
  }

  // Actions
  const actionNames = [
    ...Object.keys(actionsConfig),
    // Default actions
    ...[
      'find',
      'findOne',
      'update',
      'remove',
      'insert'
    ].filter(key => !actionsConfig[key])
  ]

  for (const actionName of actionNames) {

    contentType[actionName] = contentTypeActionCreator({
      actionName,
      actionsConfig,
      actionCommonContext,
      allowAction,
      cleanResult,
      datastore
    })
  }

  // Default items

  if (defaultItems && !await datastore.findOne({})) {
    for (const item of defaultItems) {
      await contentType.insert(item)
    }
  }

  contentTypes[typeName] = contentType

  // console.log('Created content type', typeName) // , contentType

  return contentType
}
