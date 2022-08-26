import { PaginationState } from '@tanstack/react-table';
import { PER_PAGE } from 'lib/constants';

type UpdaterFn<T> = (previousState: T) => T;

export default (
  updater: UpdaterFn<PaginationState>,
  searchParams: URLSearchParams
) => {
  const page = searchParams.get('page');
  const previousState: PaginationState = {
    // Page number starts at 1, but the pageIndex starts at 0
    pageIndex: page ? Number(page) - 1 : 0,
    pageSize: Number(searchParams.get('perPage') || PER_PAGE),
  };
  const newState = updater(previousState);
  searchParams.set('page', String(newState.pageIndex + 1));
  searchParams.set('perPage', newState.pageSize.toString());
  return previousState;
};
