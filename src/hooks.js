import * as React from "react"
import { fetchQuery, commitMutation } from "react-relay"

import { useEnvironment } from "./context"

export function useFetchQuery() {
  const environment = useEnvironment()
  return React.useCallback((query, variables) => fetchQuery(environment, query, variables), [
    environment
  ])
}

export function useCommitMutation() {
  const environment = useEnvironment()
  return React.useCallback(
    (mutation, input, config) =>
      new Promise((resolve, reject) =>
        commitMutation(environment, {
          ...config,
          mutation,
          variables: { input },
          onCompleted: (resp, errors) => {
            if (errors || resp?.errors || resp[Object.keys(resp)].errors?.length) reject(errors)
            else resolve(resp)
          },
          onError: reject
        })
      ),
    [environment]
  )
}

type CreateConfig = {|
  listArgs: any,
  listName: string,
  parentID: string,
  rootField: string,
  payloadName: ?string,
  mutationName: ?string
|}

export function useCreate(__typename: string) {
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
    (mutation, input, config = {}) => {
      const updater = makeUpdater(config)
      return commit(mutation, input, { updater })
    },
    [commit, makeUpdater]
  )
}

type UpdateConfig = {|
  dataID: ?string,
  input: {
    id: ?string
  }
|}

export function useUpdate() {
  const commit = useCommitMutation()

  const makeOptimisticUpdater = React.useCallback(({ input, dataID = input.id }: UpdateConfig) => {
    return store => {
      const node = store.get(dataID)
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
  listArgs: any,
  dataID: ?string,
  listName: string,
  parentID: string,
  rootField: string,
  input: {
    id: ?string
  }
|}

export function useDelete() {
  const commit = useCommitMutation()

  const makeUpdater = React.useCallback(
    ({ input, dataID = input.id, listName, listArgs, parentID, rootField }: DeleteConfig) => {
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
    (mutation, input, config = {}) => {
      const updater = makeUpdater({ input, ...config })
      return commit(mutation, input, { updater, optimisticUpdater: updater })
    },
    [commit, makeUpdater]
  )
}

let tempId = 0

export function isPrimitive(value) {
  return value !== Object(value)
}

export function isPlainObject(obj) {
  return obj && typeof obj === "object" && obj.constructor === Object
}

function guessType(str) {
  return str.charAt(0).toUpperCase() + str.substr(1, str.length - 2)
}

function scalarInput(input) {
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
