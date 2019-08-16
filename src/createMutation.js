/**
 * @public
 *
 * Inserts created payload record into a list
 * Example usage:
 *
 * const createMutation = useCreateMutation("Notes");
 *
 * createMutation(
 *  createNoteMutation,
 *  {
 *    content: "Hello world"
 *  },
 *  {
 *    listName: "notes",
 *    parentID: "someId"
 *  }
 * )
 *
 * @ flow
 */

'use strict';

import React from 'react';
import type {AbstractComponent} from 'react';
import type {MutationType} from 'relay-runtime';

import {useCommitMutation} from './commitMutation';

export type CreateMutationConfig = {|
  listArgs?: {},
  listName: string,
  parentID?: string,
  rootField?: string,
  payloadName?: string,
  mutationName?: string,
|};

export type CreateMutation = (
  mutation: MutationType,
  input: {},
  config: CreateMutationConfig,
) => Promise<any>;

export function useCreateMutation(__typename: string): CreateMutation {
  const commit = useCommitMutation();

  const makeUpdater = React.useCallback(
    ({
      listName,
      listArgs,
      parentID,
      rootField,
      payloadName = 'createdObject',
      mutationName = `create${__typename}`,
    }: CreateMutationConfig) => {
      return store => {
        const payload = store.getRootField(mutationName);
        const node = payload.getLinkedRecord(payloadName);

        const parent =
          store.get(parentID) || store.getRoot().getLinkedRecord(rootField);
        const nodes = parent.getLinkedRecords(listName, listArgs) || [];

        parent.setLinkedRecords([...nodes, node], listName, listArgs);
      };
    },
    [__typename],
  );

  return React.useCallback(
    (mutation, input, config) => {
      const updater = makeUpdater(config);
      return commit(mutation, input, {...config, updater});
    },
    [commit, makeUpdater],
  );
}

export function withCreateMutation<Config, Instance>(__typename: string) {
  return (
    Component: AbstractComponent<
      {|...Config, createMutation: CreateMutation|},
      Instance,
    >,
  ) => {
    return React.forwardRef<Config, Instance>((props, ref) => {
      const createMutation = useCreateMutation(__typename);
      return <Component {...props} ref={ref} createMutation={createMutation} />;
    });
  };
}
