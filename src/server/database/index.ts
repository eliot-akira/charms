/**
 * Based on https://github.com/bajankristof/nedb-promises
 *
 * - Improved typing
 * - Added datastore.persistence with daily compaction by default
 * - Added datastore.close()
 */

export { default as Datastore } from './Datastore'
export { default as Cursor } from './Cursor'
export * from './types'
