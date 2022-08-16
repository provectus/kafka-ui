import updateSortingState from 'components/common/NewTable/utils/updateSortingState';
import { SortingState } from '@tanstack/react-table';
import compact from 'lodash/compact';

const updater = (previousState: SortingState): SortingState => {
  return compact(
    previousState.map(({ id, desc }) => {
      if (!id) return null;
      return { id, desc: !desc };
    })
  );
};

describe('updateSortingState', () => {
  it('should update the sorting state', () => {
    const searchParams = new URLSearchParams();
    searchParams.set('sortBy', 'date');
    searchParams.set('sortDirection', 'desc');
    const newState = updateSortingState(updater, searchParams);
    expect(searchParams.get('sortBy')).toBe('date');
    expect(searchParams.get('sortDirection')).toBe('asc');
    expect(newState.length).toBe(1);
    expect(newState[0].id).toBe('date');
    expect(newState[0].desc).toBe(false);
  });

  it('should update the sorting state', () => {
    const searchParams = new URLSearchParams();
    const newState = updateSortingState(updater, searchParams);
    expect(searchParams.get('sortBy')).toBeNull();
    expect(searchParams.get('sortDirection')).toBeNull();
    expect(newState.length).toBe(0);
  });
});
