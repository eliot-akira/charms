import { Datastore } from '../database'
import { userTypeConfig } from '../user'
import { contentTypeCreator } from './create'
import type {
  ContentConfig,
  ContentTypeConfigs,
  ContentTypes,
  ContentApi
} from './types'

export { Datastore }
export * from './types'

const defaultTypes: ContentTypeConfigs = {
  user: userTypeConfig
}

export async function createContentApi(config: ContentConfig): Promise<ContentApi> {

  const {
    dataPath,
    types: givenTypesConfig = {},
    context: contentContext = {},
    auth,
  } = config

  const typesConfig: ContentTypeConfigs = {
    ...defaultTypes,
    ...givenTypesConfig
  }

  const contentTypes: ContentTypes = {}
  const createType = contentTypeCreator({
    auth,
    dataPath,
    contentContext,
    contentTypes
  })

  const removeType = function(typeName: string) {
    if (!contentTypes[typeName]) return

    contentTypes[typeName].datastore.close()
    delete contentTypes[typeName]
  }

  const content: ContentApi = {
    types: contentTypes,
    createType,
    removeType
  }

  for (const typeName of Object.keys(typesConfig)) {
    await content.createType({
      name: typeName,
      ...typesConfig[typeName]
    })
  }

  return content
}
