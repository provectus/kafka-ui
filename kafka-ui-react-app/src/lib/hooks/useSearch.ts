import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router';

const useSearch = (initValue = ''): [string, (value: string) => void] => {
  const history = useHistory();
  const { search, pathname } = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(search), [search]);
  const [searchValue, setSearchValue] = useState<string>(
    queryParams.get('q') || initValue.trim()
  );

  useEffect(() => {
    const currentSearch = queryParams.get('q');
    if (searchValue !== currentSearch) {
      if (searchValue) {
        queryParams.set('q', searchValue);
      } else {
        queryParams.delete('q');
      }
      history.push({ pathname, search: queryParams.toString() });
    }
  }, [searchValue]);

  const handleChange = useCallback((value: string) => {
    setSearchValue(value.trim());
  }, []);

  return [searchValue, handleChange];
};

export default useSearch;
