// @flow

'use strict';

import type {AbstractComponent} from 'react';
import type {
  $RelayProps,
  RelayRefetchProp,
  GeneratedNodeMap,
  RelayPaginationProp,
} from 'react-relay';
import type {
  RelayProp,
  ConnectionConfig,
  GraphQLTaggedNode,
} from 'relay-runtime';
import {
  createRefetchContainer,
  createFragmentContainer,
  createPaginationContainer,
} from 'react-relay';

/**
 * @public
 *
 * createFragmentContainer as an HOC
 * Example usage:
 *
 * @createFragmentContainer(fragment)
 * class MyComponent extends React.Component { ... }
 */
export function fragment(fragment: GeneratedNodeMap) {
  return function<
    Props: {},
    Instance,
    TComponent: AbstractComponent<Props, Instance>,
  >(
    Component: TComponent,
  ): AbstractComponent<
    $RelayProps<React$ElementConfig<TComponent>, RelayProp>,
  > {
    return createFragmentContainer(Component, fragment);
  };
}

/**
 * @public
 *
 * createRefetchContainer as an HOC
 * Example usage:
 *
 * @createRefetchContainer(fragment, query)
 * class MyComponent extends React.Component { ... }
 */
export function refetch(fragment: GeneratedNodeMap, query: GraphQLTaggedNode) {
  return function<
    Props: {},
    Instance,
    TComponent: AbstractComponent<Props, Instance>,
  >(
    Component: TComponent,
  ): AbstractComponent<
    $RelayProps<React$ElementConfig<TComponent>, RelayRefetchProp>,
  > {
    return createRefetchContainer(Component, fragment, query);
  };
}

/**
 * @public
 *
 * createPaginationContainer as an HOC
 * Example usage:
 *
 * @createPaginationContainer(fragment, config)
 * class MyComponent extends React.Component { ... }
 */
export function pagination(
  fragment: GeneratedNodeMap,
  config: ConnectionConfig,
) {
  return function<
    Props: {},
    Instance,
    TComponent: AbstractComponent<Props, Instance>,
  >(
    Component: TComponent,
  ): AbstractComponent<
    $RelayProps<React$ElementConfig<TComponent>, RelayPaginationProp>,
  > {
    return createPaginationContainer(Component, fragment, config);
  };
}
