import { PaginationState } from '@tanstack/react-table';
import { PER_PAGE } from 'lib/constants';

type UpdaterFn<T> = (previousState: T) => T;

export default (
  updater: UpdaterFn<PaginationState>,
  searchParams: URLSearchParams
) => {
  const previousState: PaginationState = {
    pageIndex: Number(searchParams.get('page') || 0),
    pageSize: Number(searchParams.get('perPage') || PER_PAGE),
  };
  const newState = updater(previousState);
  if (newState.pageIndex !== 0) {
    searchParams.set('page', newState.pageIndex.toString());
  } else {
    searchParams.delete('page');
  }

  if (newState.pageSize !== PER_PAGE) {
    searchParams.set('perPage', newState.pageSize.toString());
  } else {
    searchParams.delete('perPage');
  }
  return newState;
};
