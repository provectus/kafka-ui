import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import Input from 'components/common/Input/Input';
import { useSearchParams } from 'react-router-dom';

interface SearchProps {
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  value?: string;
}

const Search: React.FC<SearchProps> = ({
  placeholder = 'Search',
  disabled = false,
  value,
  onChange,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const handleChange = useDebouncedCallback((e) => {
    if (onChange) {
      onChange(e.target.value);
    } else {
      searchParams.set('q', e.target.value);
      if (searchParams.get('page')) {
        searchParams.set('page', '1');
      }
      setSearchParams(searchParams);
    }
  }, 500);

  return (
    <Input
      type="text"
      placeholder={placeholder}
      onChange={handleChange}
      defaultValue={value || searchParams.get('q') || ''}
      inputSize="M"
      disabled={disabled}
      search
    />
  );
};

export default Search;
