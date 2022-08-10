import { SortingState } from '@tanstack/react-table';

type UpdaterFn<T> = (previousState: T) => T;

export default (
  updater: UpdaterFn<SortingState>,
  searchParams: URLSearchParams
) => {
  const previousState: SortingState = [
    {
      id: searchParams.get('sortBy') || '',
      desc: searchParams.get('sortDirection') === 'desc',
    },
  ];
  const newState = updater(previousState);

  if (newState.length > 0) {
    const { id, desc } = newState[0];
    searchParams.set('sortBy', id);
    searchParams.set('sortDirection', desc ? 'desc' : 'asc');
  } else {
    searchParams.delete('sortBy');
    searchParams.delete('sortDirection');
  }
  return newState;
};
