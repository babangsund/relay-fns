/**
 * @public
 *
 * Deletes a record from a list
 * Example usage:
 *
 * const deleteMutation = useDeleteMutation();
 *
 * deleteMutation(
 *  deleteNoteMutation,
 *  {
 *    id: "noteId"
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

export type DeleteMutationConfig = {|
  listArgs?: {},
  dataID?: string,
  listName: string,
  parentID?: string,
  rootField?: string,
  input: {
    id?: string,
  },
|};

export type DeleteMutation = (
  mutation: MutationType,
  input: {|id?: string|},
  config: DeleteMutationConfig,
) => Promise<any>;

export function useDeleteMutation(): DeleteMutation {
  const commit = useCommitMutation();

  const makeUpdater = React.useCallback(
    ({
      input,
      dataID = input.id || '',
      listName,
      listArgs,
      parentID,
      rootField,
    }: DeleteMutationConfig) => {
      return store => {
        const parent =
          store.get(parentID) || store.getRoot().getLinkedRecord(rootField);
        const nodes = parent.getLinkedRecords(listName, listArgs) || [];
        parent.setLinkedRecords(
          nodes.filter(x => x && x.getDataID() !== dataID),
          listName,
          listArgs,
        );
      };
    },
    [],
  );

  return React.useCallback(
    (mutation, input, config) => {
      const updater = makeUpdater({input, ...config});
      return commit(mutation, input, {
        ...config,
        updater,
        optimisticUpdater: updater,
      });
    },
    [commit, makeUpdater],
  );
}

export function withDeleteMutation<Config, Instance>(
  Component: AbstractComponent<
    {|...Config, deleteMutation: DeleteMutation|},
    Instance,
  >,
) {
  return React.forwardRef<Config, Instance>((props, ref) => {
    const commitMutation = useDeleteMutation();
    return <Component {...props} ref={ref} deleteMutation={commitMutation} />;
  });
}
