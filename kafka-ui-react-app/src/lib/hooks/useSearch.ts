import { useCallback, useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router';

const SEARCH_QUERY_ARG = 'q';

// meant for use with <Search> component
// returns value of Q search param (?q='something') and callback to change it
const useSearch = (initValue = ''): [string, (value: string) => void] => {
  const history = useHistory();
  const { search, pathname } = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(search), [search]);
  const q = useMemo(
    () => queryParams.get(SEARCH_QUERY_ARG)?.trim(),
    [queryParams]
  );
  const page = useMemo(() => queryParams.get('page')?.trim(), [queryParams]);

  // set intial value
  useEffect(() => {
    if (initValue.trim() !== '' && !q) {
      queryParams.set(SEARCH_QUERY_ARG, initValue.trim());
      history.push({ pathname, search: queryParams.toString() });
    }
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      const trimmedValue = value.trim();
      if (trimmedValue !== q) {
        if (trimmedValue) {
          queryParams.set(SEARCH_QUERY_ARG, trimmedValue);
        } else {
          queryParams.delete(SEARCH_QUERY_ARG);
        }
        // If we were on page 3 we can't determine if new search results have 3 pages - so we always reset page
        if (page) {
          queryParams.delete('page');
        }
        history.replace({ pathname, search: queryParams.toString() });
      }
    },
    [history, pathname, queryParams, q]
  );

  return [q || initValue.trim() || '', handleChange];
};

export default useSearch;
