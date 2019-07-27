// @flow
import * as React from "react"
import {} from "relay-runtime"
import type { MutationType, Variables, MutationConfig, GraphQLTaggedNode } from "relay-runtime"
import { fetchQuery, commitMutation } from "react-relay"

import { useEnvironment } from "./context"

type UseFetchQuery = (query: GraphQLTaggedNode, variables: Variables) => Promise<{}>

export function useFetchQuery(): UseFetchQuery {
  const environment = useEnvironment()
  return React.useCallback((query, variables) => fetchQuery(environment, query, variables), [
    environment
  ])
}

type UseCommitMutation = (
  mutation: MutationType,
  input: {},
  variables: MutationConfig
) => Promise<{} | []>

export function useCommitMutation(): UseCommitMutation {
  const environment = useEnvironment()
  return React.useCallback(
    (mutation, input, config) =>
      new Promise((resolve, reject) =>
        commitMutation(environment, {
          ...config,
          mutation,
          variables: { input },
          onCompleted: (resp, es) => {
            const errors = es || resp?.errors || resp[Object.keys(resp)].errors || []
            if (errors.length) reject(errors)
            else resolve(resp)
          },
          onError: reject
        })
      ),
    [environment]
  )
}

type CreateConfig = {|
  listArgs?: {},
  listName: string,
  parentID?: string,
  rootField?: string,
  payloadName?: string,
  mutationName?: string
|}

type UseCreate = (mutation: MutationType, input: {}, config: CreateConfig) => Promise<any>

export function useCreate(__typename: string): UseCreate {
  const commit = useCommitMutation()

  const makeUpdater = React.useCallback(
    ({
      listName,
      listArgs,
      parentID,
      rootField,
      payloadName = "createdObject",
      mutationName = `create${__typename}`
    }: CreateConfig) => {
      return store => {
        const payload = store.getRootField(mutationName)
        const node = payload.getLinkedRecord(payloadName)

        const parent = store.get(parentID) || store.getRoot().getLinkedRecord(rootField)
        const nodes = parent.getLinkedRecords(listName, listArgs) || []

        parent.setLinkedRecords([...nodes, node], listName, listArgs)
      }
    },
    [__typename]
  )

  return React.useCallback(
    (mutation, input, config) => {
      const updater = makeUpdater(config)
      return commit(mutation, input, { updater })
    },
    [commit, makeUpdater]
  )
}

type UpdateConfig = {|
  dataID?: string,
  input: {
    id?: string
  }
|}

type UseUpdate = (
  mutation: MutationType,
  input: {| id?: string |},
  config?: UpdateConfig
) => Promise<any>

export function useUpdate(): UseUpdate {
  const commit = useCommitMutation()

  const makeOptimisticUpdater = React.useCallback(({ input, dataID }: UpdateConfig) => {
    return store => {
      const id = dataID || input.id
      const node = store.get(id)
      setValues(store, node, input)
    }
  }, [])

  return React.useCallback(
    (mutation, input, config = {}) => {
      const optimisticUpdater = makeOptimisticUpdater({ input, ...config })
      return commit(mutation, input, { optimisticUpdater })
    },
    [commit, makeOptimisticUpdater]
  )
}

type DeleteConfig = {|
  listArgs?: {},
  dataID?: string,
  listName: string,
  parentID?: string,
  rootField?: string,
  input: {
    id?: string
  }
|}

type UseDelete = (
  mutation: MutationType,
  input: {| id?: string |},
  config: DeleteConfig
) => Promise<any>

export function useDelete(): UseDelete {
  const commit = useCommitMutation()

  const makeUpdater = React.useCallback(
    ({ input, dataID = input.id || "", listName, listArgs, parentID, rootField }: DeleteConfig) => {
      return store => {
        const parent = store.get(parentID) || store.getRoot().getLinkedRecord(rootField)
        const nodes = parent.getLinkedRecords(listName, listArgs) || []
        parent.setLinkedRecords(
          nodes.filter(x => x && x.getDataID() !== dataID),
          listName,
          listArgs
        )
      }
    },
    []
  )

  return React.useCallback(
    (mutation, input, config) => {
      const updater = makeUpdater({ input, ...config })
      return commit(mutation, input, { updater, optimisticUpdater: updater })
    },
    [commit, makeUpdater]
  )
}

let tempId = 0

export function isPrimitive(value: any) {
  return value !== Object(value)
}

export function isPlainObject(obj: ?{}) {
  return obj && typeof obj === "object" && obj.constructor === Object
}

function guessType(str) {
  return str.charAt(0).toUpperCase() + str.substr(1, str.length - 2)
}

function scalarInput(input: {}) {
  return Object.keys(input).reduce((acc, curr) => {
    const _acc = acc
    const value = input[curr]

    if (value === undefined) return _acc
    if (typeof value === "string" && curr.endsWith("Id")) return _acc

    if (isPlainObject(value)) input[curr] = scalarInput(value)
    if (value instanceof Date) input[curr] = value.toUTCString()
    _acc[curr] = input[curr]
    return _acc
  }, {})
}

function setValues(store, node, input) {
  input = scalarInput(input)
  Object.keys(input).forEach(key => {
    const value = input[key]
    if (isPrimitive(value)) node.setValue(value, key)
    else if (Array.isArray(value) && isPrimitive(value[0])) node.setValue(value, key)
    else if (Array.isArray(value)) {
      const type = guessType(key)
      const records = value.map(x => {
        const record = store.create(`client:${type}:${tempId++}`, type)
        Object.keys(x).forEach(key => record.setValue(x[key], key))
        return record
      })
      node.setLinkedRecords(records, key)
    } else if (isPlainObject(value)) {
      Object.keys(value).forEach(nestedKey => {
        const nestedNode = node.getOrCreateLinkedRecord(
          key,
          key.replace(/^\w/, c => c.toUpperCase())
        )
        setValues(store, nestedNode, { [nestedKey]: value[nestedKey] })
      })
    }
  })
}
