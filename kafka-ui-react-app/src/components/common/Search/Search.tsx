import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import Input from 'components/common/Input/Input';

interface SearchProps {
  handleSearch: (value: string) => void;
  placeholder?: string;
  value: string;
  disabled?: boolean;
}

const Search: React.FC<SearchProps> = ({
  handleSearch,
  placeholder = 'Search',
  value,
  disabled = false,
}) => {
  const onChange = useDebouncedCallback(
    (e) => handleSearch(e.target.value),
    300
  );

  return (
    <Input
      type="text"
      placeholder={placeholder}
      onChange={onChange}
      defaultValue={value}
      inputSize="M"
      disabled={disabled}
      search
    />
  );
};

export default Search;
