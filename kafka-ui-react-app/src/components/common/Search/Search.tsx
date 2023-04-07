import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import Input from 'components/common/Input/Input';
import { useSearchParams } from 'react-router-dom';
import CloseIcon from 'components/common/Icons/CloseIcon';

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
  const ref = React.createRef<HTMLInputElement>();
  const handleChange = useDebouncedCallback((e) => {
    if (ref.current != null) {
      ref.current.value = e.target.value;
    }
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
  const clearSearchValue = () => {
    if (searchParams.get('q')) {
      searchParams.set('q', '');
      setSearchParams(searchParams);
    }
    if (ref.current != null) {
      ref.current.value = '';
    }
  };
  return (
    <Input
      type="text"
      placeholder={placeholder}
      onChange={handleChange}
      defaultValue={value || searchParams.get('q') || ''}
      inputSize="M"
      disabled={disabled}
      ref={ref}
      search
    >
      <div aria-hidden role="button" onClick={clearSearchValue}>
        <CloseIcon />
      </div>
    </Input>
  );
};

export default Search;
