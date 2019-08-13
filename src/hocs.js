// @flow
import * as React from 'react';

import {
  createRefetchContainer,
  createFragmentContainer,
  createPaginationContainer,
} from 'react-relay';

import {
  useCreate,
  useUpdate,
  useDelete,
  useFetchQuery,
  useLocalCommit,
  useCommitMutation,
} from './hooks';

type Fragment = {
  [key: string]: string,
};

export const fragment = (fragment: Fragment) => (
  Component: React.AbstractComponent<{}>,
) => {
  return createFragmentContainer(Component, fragment);
};

export const refetch = (fragment: Fragment, query: string) => (
  Component: React.AbstractComponent<{}>,
) => {
  return createRefetchContainer(Component, fragment, query);
};

export const pagination = (fragment: Fragment, config: Object) => (
  Component: React.AbstractComponent<{}>,
) => {
  return createPaginationContainer(Component, fragment, config);
};

export function withFetchQuery<Config, Instance>(
  Component: React.AbstractComponent<Config>,
) {
  return React.forwardRef<Config, Instance>((props, ref) => {
    const fetchQuery = useFetchQuery();
    return <Component {...props} ref={ref} fetchQuery={fetchQuery} />;
  });
}

export function withCommitMutation<Config, Instance>(
  Component: React.AbstractComponent<Config>,
) {
  return React.forwardRef<Config, Instance>((props, ref) => {
    const commitMutation = useCommitMutation();
    return <Component {...props} ref={ref} commitMutation={commitMutation} />;
  });
}

export function withLocalCommit<Config, Instance>(
  Component: React.AbstractComponent<Config>,
) {
  return React.forwardRef<Config, Instance>((props, ref) => {
    const localCommit = useLocalCommit();
    return <Component {...props} ref={ref} localCommit={localCommit} />;
  });
}

export function withCreate<Config, Instance>(__typename: string) {
  return (Component: React.AbstractComponent<Config>) => {
    return React.forwardRef<Config, Instance>((props, ref) => {
      const commitMutation = useCreate(__typename);
      return <Component {...props} ref={ref} create={commitMutation} />;
    });
  };
}

export function withUpdate<Config, Instance>(
  Component: React.AbstractComponent<Config>,
) {
  return React.forwardRef<Config, Instance>((props, ref) => {
    const commitMutation = useUpdate();
    return <Component {...props} ref={ref} update={commitMutation} />;
  });
}

export function withDelete<Config, Instance>(
  Component: React.AbstractComponent<Config>,
) {
  return React.forwardRef<Config, Instance>((props, ref) => {
    const commitMutation = useDelete();
    return <Component {...props} ref={ref} delete={commitMutation} />;
  });
}
