/**
 * @public
 *
 * Optimistically updates a record with the input values
 * Example usage:
 *
 * const updateMutation = useUpdateMutation();
 *
 * updateMutation(
 *  updateNoteMutation,
 *  {
 *    id: "noteId"
 *    content: "New content"
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

type UpdateMutationConfig = {|
  dataID?: string,
  input: {
    id?: string,
  },
|};

type UpdateMutation = (
  mutation: MutationType,
  input: {|id?: string|},
  config?: UpdateMutationConfig,
) => Promise<any>;

export function useUpdateMutation(): UpdateMutation {
  const commit = useCommitMutation();

  const makeOptimisticUpdater = React.useCallback(
    ({input, dataID}: UpdateMutationConfig) => {
      return store => {
        const id = dataID || input.id;
        const node = store.get(id);
        setValues(store, node, input);
      };
    },
    [],
  );

  return React.useCallback(
    (mutation, input, config = {}) => {
      const optimisticUpdater = makeOptimisticUpdater({input, ...config});
      return commit(mutation, input, {optimisticUpdater});
    },
    [commit, makeOptimisticUpdater],
  );
}

export function withUpdateMutation<Config, Instance>(
  Component: AbstractComponent<
    {|...Config, updateMutation: UpdateMutation|},
    Instance,
  >,
) {
  return React.forwardRef<Config, Instance>((props, ref) => {
    const commitMutation = useUpdateMutation();
    return <Component {...props} ref={ref} updateMutation={commitMutation} />;
  });
}

/**
 * @internal
 *
 * Utility functions for setting input on a record
 */

function isPrimitive(value: any) {
  return value !== Object(value);
}

function isPlainObject(obj: ?{}) {
  return obj && typeof obj === 'object' && obj.constructor === Object;
}

function guessType(str) {
  return str.charAt(0).toUpperCase() + str.substr(1, str.length - 2);
}

function scalarInput(input: {}) {
  return Object.keys(input).reduce((acc, curr) => {
    const _acc = acc;
    const value = input[curr];

    if (value === undefined) return _acc;
    if (typeof value === 'string' && curr.endsWith('Id')) return _acc;

    if (isPlainObject(value)) input[curr] = scalarInput(value);
    if (value instanceof Date) input[curr] = value.toUTCString();
    _acc[curr] = input[curr];
    return _acc;
  }, {});
}

let tempID = 0;
function setValues(store, node, input) {
  input = scalarInput(input);
  Object.keys(input).forEach(key => {
    const value = input[key];
    if (isPrimitive(value)) node.setValue(value, key);
    else if (Array.isArray(value) && (isPrimitive(value[0]) || !value.length)) {
      node.setValue(value, key);
    } else if (Array.isArray(value)) {
      const type = guessType(key);
      const records = value.map(x => {
        const record = store.create(`client:${type}:${tempID++}`, type);
        Object.keys(x).forEach(key => record.setValue(x[key], key));
        return record;
      });
      node.setLinkedRecords(records, key);
    } else if (isPlainObject(value)) {
      Object.keys(value).forEach(nestedKey => {
        const nestedNode = node.getOrCreateLinkedRecord(
          key,
          key.replace(/^\w/, c => c.toUpperCase()),
        );
        setValues(store, nestedNode, {[nestedKey]: value[nestedKey]});
      });
    }
  });
}
