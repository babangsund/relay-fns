// @flow
import * as React from "react"
import {
  createRefetchContainer,
  createFragmentContainer,
  createPaginationContainer
} from "react-relay"

import { useCreate, useUpdate, useDelete, useFetchQuery, useCommitMutation } from "./hooks"

type Fragment = {
  [key: string]: string
}

export const fragment = (fragment: Fragment) => (Component: React.AbstractComponent<any>) => {
  return createFragmentContainer(Component, fragment)
}

export const refetch = (fragment: Fragment, query: string) => (
  Component: React.AbstractComponent<any>
) => {
  return createRefetchContainer(Component, fragment, query)
}

export const pagination = (fragment: Fragment, config: Object) => (
  Component: React.AbstractComponent<any>
) => {
  return createPaginationContainer(Component, fragment, config)
}

export function withFetchQuery<Config, Instance>(Component: React.AbstractComponent<Config>) {
  return React.forwardRef<Config, Instance>((props, ref) => {
    const fetchQuery = useFetchQuery()
    return <Component {...props} ref={ref} fetchQuery={fetchQuery} />
  })
}

export function withCommitMutation<Config, Instance>(Component: React.AbstractComponent<Config>) {
  return React.forwardRef<Config, Instance>((props, ref) => {
    const commitMutation = useCommitMutation()
    return <Component {...props} ref={ref} commitMutation={commitMutation} />
  })
}

export function withCreate<Config, Instance>(__typename: string) {
  return (Component: React.AbstractComponent<Config>) => {
    return React.forwardRef<Config, Instance>((props, ref) => {
      const commitMutation = useCreate(__typename)
      return <Component {...props} ref={ref} create={commitMutation} />
    })
  }
}

export function withUpdate<Config, Instance>(Component: React.AbstractComponent<Config>) {
  return React.forwardRef<Config, Instance>((props, ref) => {
    const commitMutation = useUpdate()
    return <Component {...props} ref={ref} update={commitMutation} />
  })
}

export function withDelete<Config, Instance>(Component: React.AbstractComponent<Config>) {
  return React.forwardRef<Config, Instance>((props, ref) => {
    const commitMutation = useDelete()
    return <Component {...props} ref={ref} delete={commitMutation} />
  })
}
