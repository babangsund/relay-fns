/**
 * @public
 *
 * Calls commitMutation with environment and returns a promise.
 * Example usage:
 *
 * const commitMutation = useCommitMutation();
 *
 * commitMutation(
 *   someMutation,
 *   {
 *     content: "Hello world"
 *   }
 * )
 * .then((response) => console.info(response))
 * .catch((error) => console.error(error));
 *
 * @flow
 */

'use strict';

import React from 'react';
import type {AbstractComponent} from 'react';
import {commitMutation} from 'react-relay';
import type {MutationType, MutationConfig} from 'relay-runtime';

import {useEnvironment} from './Environment';

type CommitMutation = (
  mutation: MutationType,
  input: {},
  variables: MutationConfig,
) => Promise<{} | []>;

export function useCommitMutation(): CommitMutation {
  const environment = useEnvironment();
  return React.useCallback(
    (mutation, input, config) =>
      new Promise((resolve, reject) =>
        commitMutation(environment, {
          ...config,
          mutation,
          variables: {input, ...(config?.variables || {})},
          onCompleted: (resp, es) => {
            const errors =
              es || resp?.errors || resp[Object.keys(resp)].errors || [];
            if (errors.length) reject(errors);
            else resolve(resp);
          },
          onError: reject,
        }),
      ),
    [environment],
  );
}

export function withCommitMutation<Config, Instance>(
  Component: AbstractComponent<
    {|...Config, commitMutation: CommitMutation|},
    Instance,
  >,
) {
  return React.forwardRef<Config, Instance>((props, ref) => {
    const commitMutation = useCommitMutation();
    return <Component {...props} ref={ref} commitMutation={commitMutation} />;
  });
}
