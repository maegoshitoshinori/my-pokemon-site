import React, { useState } from 'react';
import './SearchForm.css';

interface Props {
  onSearch: (query: string) => void;
}

const SearchForm: React.FC<Props> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="text"
        placeholder="ポケモン名を入力"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit">検索</button>
    </form>
  );
};

export default SearchForm;