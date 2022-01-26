import { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';

const useSearch = (initValue = ''): [string, (value: string) => void] => {
  const [searchValue, setSearchValue] = useState<string>(initValue);
  const history = useHistory();
  const { search, pathname } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const currentSearch = params.get('q');
    if (!searchValue && currentSearch) setSearchValue(currentSearch);

    if (searchValue) {
      params.set('q', searchValue);
    } else {
      params.delete('q');
    }
    history.push({ pathname, search: params.toString() });
  }, [searchValue]);

  const handleChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  return [searchValue, handleChange];
};

export default useSearch;
