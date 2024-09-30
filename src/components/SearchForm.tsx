// src/components/SearchForm.tsx

import React, { useState } from 'react';

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
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="ポケモン名またはタイプを入力"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit">検索</button>
    </form>
  );
};

export default SearchForm;
