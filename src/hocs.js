// @flow
import * as React from "react"
import {
  createRefetchContainer,
  createFragmentContainer,
  createPaginationContainer
} from "react-relay"

export const fragment = (fragment: string) => (Component: React.AbstractComponent<any>) => {
  return createFragmentContainer(Component, fragment)
}
export const refetch = (fragment: string, query: string) => (
  Component: React.AbstractComponent<any>
) => {
  return createRefetchContainer(Component, fragment, query)
}
export const pagination = (fragment: string, config: Object) => (
  Component: React.AbstractComponent<any>
) => {
  return createPaginationContainer(Component, fragment, config)
}
