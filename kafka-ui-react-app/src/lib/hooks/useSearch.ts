import { useState } from 'react';

const useSearch = (initValue = ''): [string, (value: string) => void] => {
  const [search, setSearch] = useState<string>(initValue);

  const handleChange = (value: string) => {
    setSearch(value);
  };

  return [search, handleChange];
};

export default useSearch;
