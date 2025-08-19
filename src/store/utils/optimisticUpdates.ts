import { adminApi } from "../api/adminApi";
import { store } from "../index";

/**
 * Utility functions for optimistic updates
 */

export interface OptimisticUpdateConfig<T> {
  queryKey: string;
  updateFn: (draft: T, update: any) => void;
  rollbackFn?: (draft: T, originalData: T) => void;
}

/**
 * Perform an optimistic update for a list query
 */
export function optimisticListUpdate<T extends { id: string }>(
  endpoint: string,
  queryArgs: any,
  itemId: string,
  updateData: Partial<T>
) {
  const dispatch = store.dispatch;

  // Update the cache optimistically
  dispatch(
    adminApi.util.updateQueryData(endpoint as any, queryArgs, (draft: any) => {
      const item = draft.data?.rows?.find((item: T) => item.id === itemId);
      if (item) {
        Object.assign(item, updateData);
      }
    })
  );
}

/**
 * Perform an optimistic update for a single item query
 */
export function optimisticItemUpdate<T>(
  endpoint: string,
  itemId: string,
  updateData: Partial<T>
) {
  const dispatch = store.dispatch;

  // Update the cache optimistically
  dispatch(
    adminApi.util.updateQueryData(endpoint as any, itemId, (draft: T) => {
      Object.assign(draft, updateData);
    })
  );
}

/**
 * Optimistically add an item to a list
 */
export function optimisticListAdd<T extends { id: string }>(
  endpoint: string,
  queryArgs: any,
  newItem: T
) {
  const dispatch = store.dispatch;

  dispatch(
    adminApi.util.updateQueryData(endpoint as any, queryArgs, (draft: any) => {
      if (draft.data?.rows) {
        draft.data.rows.unshift(newItem);
        draft.data.total += 1;
      }
    })
  );
}

/**
 * Optimistically remove an item from a list
 */
export function optimisticListRemove<T extends { id: string }>(
  endpoint: string,
  queryArgs: any,
  itemId: string
) {
  const dispatch = store.dispatch;

  dispatch(
    adminApi.util.updateQueryData(endpoint as any, queryArgs, (draft: any) => {
      if (draft.data?.rows) {
        const index = draft.data.rows.findIndex(
          (item: T) => item.id === itemId
        );
        if (index !== -1) {
          draft.data.rows.splice(index, 1);
          draft.data.total -= 1;
        }
      }
    })
  );
}

/**
 * Rollback optimistic updates on error
 */
export function rollbackOptimisticUpdate(
  endpoint: string,
  queryArgs: any,
  originalData: any
) {
  const dispatch = store.dispatch;

  dispatch(
    adminApi.util.updateQueryData(
      endpoint as any,
      queryArgs,
      () => originalData
    )
  );
}

/**
 * Higher-order function to wrap mutations with optimistic updates
 */
export function withOptimisticUpdate<TArgs, TResult>(
  mutation: any,
  optimisticUpdateFn: (args: TArgs) => void,
  rollbackFn?: (args: TArgs, error: any) => void
) {
  return async (args: TArgs): Promise<TResult> => {
    // Apply optimistic update
    optimisticUpdateFn(args);

    try {
      // Execute the actual mutation
      const result = await mutation(args).unwrap();
      return result;
    } catch (error) {
      // Rollback on error
      if (rollbackFn) {
        rollbackFn(args, error);
      }
      throw error;
    }
  };
}

/**
 * Invalidate related queries after successful mutations
 */
export function invalidateRelatedQueries(tags: string[]) {
  const dispatch = store.dispatch;

  tags.forEach((tag) => {
    dispatch(adminApi.util.invalidateTags([tag]));
  });
}

/**
 * Prefetch related data
 */
export function prefetchRelatedData(endpoint: string, args: any) {
  const dispatch = store.dispatch;

  dispatch(adminApi.util.prefetch(endpoint as any, args));
}

/**
 * Batch multiple optimistic updates
 */
export function batchOptimisticUpdates(updates: Array<() => void>) {
  updates.forEach((update) => update());
}
