/**
 * @public
 *
 * Local version of fetchQuery.
 * Example usage:
 *
 * function Example() {
 *   const {viewer} = useLocalQuery(
 *     graphql`
 *       query ExampleQuery {
 *         viewer {
 *           __typename
 *           settings {
 *             status
 *           }
 *         }
 *       }
 *     `
 *   );
 * }
 *
 * @ flow
 */

'use strict';

import React from 'react';

import {useEnvironment} from './Environment';
import {useDeepCompare} from './useDeepCompare';

export function useLocalQuery(
  query: GraphQLTaggedNode,
  variables: Variables,
): ?Object {
  const environment = useEnvironment();
  const {getRequest, createOperationDescriptor} = environment.unstable_internal;

  const latestVariables = useDeepCompare(variables);
  const operation = React.useMemo(() => {
    const request = getRequest(query);
    return createOperationDescriptor(request, latestVariables);
  }, [query, getRequest, latestVariables, createOperationDescriptor]);

  // Use a ref to prevent rendering twice when data changes
  // because of props change
  const dataRef = React.useRef(null);
  const [, forceUpdate] = React.useState(null);
  const cleanupFnRef = React.useRef(null);

  const snapshot = React.useMemo(() => {
    environment.check(operation.root);
    const res = environment.lookup(operation.fragment);
    dataRef.current = res.data;

    // Run effects here so that the data can be retained
    // and subscribed before the component commits
    const retainDisposable = environment.retain(operation.root);
    const subscribeDisposable = environment.subscribe(res, newSnapshot => {
      dataRef.current = newSnapshot.data;
      forceUpdate(dataRef.current);
    });

    let disposed = false;
    function nextCleanupFn() {
      if (!disposed) {
        disposed = true;
        cleanupFnRef.current = null;
        retainDisposable.dispose();
        subscribeDisposable.dispose();
      }
    }

    if (cleanupFnRef.current) {
      cleanupFnRef.current();
    }

    cleanupFnRef.current = nextCleanupFn;
    return res;
  }, [environment, operation]);

  React.useLayoutEffect(() => {
    const cleanupFn = cleanupFnRef.current;
    return () => {
      cleanupFn && cleanupFn();
    };
  }, [snapshot]);

  return dataRef.current;
}
