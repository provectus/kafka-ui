import React from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface SearchProps {
  handleSearch: (value: string) => void;
  placeholder: string;
}

const Search: React.FC<SearchProps> = ({ handleSearch, placeholder }) => {
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
      />
      <span className="icon is-small is-left">
        <i className="fas fa-search" />
      </span>
    </p>
  );
};

export default Search;
