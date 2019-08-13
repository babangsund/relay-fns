// @flow

'use strict';

import React from 'react';
import type {AbstractComponent} from 'react';
import {commitLocalUpdate} from 'react-relay';
import type {StoreUpdater} from 'relay-runtime';

import {useEnvironment} from './Environment';

export type LocalCommit = (updater: StoreUpdater) => void;

export function useLocalCommit(): LocalCommit {
  const environment = useEnvironment();
  return React.useCallback(updater => commitLocalUpdate(environment, updater), [
    environment,
  ]);
}

export function withLocalCommit<Config, Instance>(
  Component: AbstractComponent<
    {|...Config, localCommit: LocalCommit|},
    Instance,
  >,
) {
  return React.forwardRef<Config, Instance>((props, ref) => {
    const localCommit = useLocalCommit();
    return <Component {...props} ref={ref} localCommit={localCommit} />;
  });
}
