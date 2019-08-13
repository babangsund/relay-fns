/**
 * For querying local data
 */
export {useLocalQuery} from './localQuery';

/**
 * For creating an item in a list
 */
export {useCreateMutation, withCreateMutation} from './createMutation';
export type {CreateMutation, CreateMutationConfig} from './createMutation';

/**
 * For optimistically updating a record
 */
export {useUpdateMutation, withUpdateMutation} from './updateMutation';
export type {UpdateMutation, UpdateMutationConfig} from './updateMutation';

/**
 * For deleting an item from a list.
 */
export {useDeleteMutation, withDeleteMutation} from './deleteMutation';
export type {DeleteMutation, DeleteMutationConfig} from './deleteMutation';

/**
 * Environment provider wrappers
 */
export {
  useEnvironment,
  withEnvironment,
  EnvironmentContext,
  EnvironmentProvider,
} from './Environment';
export type {EnvironmentProviderProps} from './Environment';

export {useLocalCommit, withLocalCommit} from './commitLocalUpdate';
export type {LocalCommit} from './commitLocalUpdate';

export {useCommitMutation, withCommitMutation} from './commitMutation';
export type {CommitMutation} from './commitMutation';

export {useFetchQuery, withFetchQuery} from './fetchQuery';
export type {FetchQuery} from './fetchQuery';

export {fragment, refetch, pagination} from './hocs';

/**
 * Utility
 */
export {deepFreeze} from './deepFreeze';
export {useDeepCompare} from './useDeepCompare';
