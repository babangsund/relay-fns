// @flow

'use strict';

import React from 'react';
import {fetchQuery} from 'react-relay';
import type {AbstractComponent} from 'react';
import type {Variables, GraphQLTaggedNode} from 'relay-runtime';

import {useEnvironment} from './Environment';

type FetchQuery = (
  query: GraphQLTaggedNode,
  variables: Variables,
) => Promise<{}>;

export function useFetchQuery(): FetchQuery {
  const environment = useEnvironment();
  return React.useCallback(
    (query, variables) => fetchQuery(environment, query, variables),
    [environment],
  );
}

export function withFetchQuery<Config, Instance>(
  Component: AbstractComponent<{|...Config, fetchQuery: FetchQuery|}, Instance>,
) {
  return React.forwardRef<Config, Instance>((props, ref) => {
    const fetchQuery = useFetchQuery();
    return <Component {...props} ref={ref} fetchQuery={fetchQuery} />;
  });
}
