import React from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface SearchProps {
  handleSearch: (value: string) => void;
  placeholder?: string;
  value: string;
}

const Search: React.FC<SearchProps> = ({
  handleSearch,
  placeholder = 'Search',
  value,
}) => {
  const onChange = useDebouncedCallback(
    (e) => handleSearch(e.target.value),
    300
  );
  return (
    <p className="control has-icons-left">
      <input
        className="input"
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        defaultValue={value}
      />
      <span className="icon is-small is-left">
        <i className="fas fa-search" />
      </span>
    </p>
  );
};

export default Search;
