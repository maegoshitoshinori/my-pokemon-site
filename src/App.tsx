// src/App.tsx

import React, { useState } from 'react';
import axios from 'axios';
import SearchForm from './components/SearchForm';
import PokemonCard from './components/PokemonCard';
import './App.css';

const App: React.FC = () => {
  const [pokemonData, setPokemonData] = useState<any>(null);

  const handleSearch = async (query: string) => {
    try {
      // 全ポケモン種のリストを取得
      const speciesResponse = await axios.get('https://pokeapi.co/api/v2/pokemon-species?limit=10000');
      const speciesList = speciesResponse.data.results;

      let pokemonEntry = null;
      let japaneseNameEntry = null;

      // 日本語名でフィルタリング
      for (const species of speciesList) {
        const speciesDetail = await axios.get(species.url);
        const names = speciesDetail.data.names;
        japaneseNameEntry = names.find((name: any) => name.language.name === 'ja-Hrkt');

        // 名前が一致する場合
        if (japaneseNameEntry && japaneseNameEntry.name === query) {
          pokemonEntry = speciesDetail.data;
          break;
        }

        // タイプで検索する場合は追加のロジックが必要です
      }

      if (pokemonEntry) {
        // ポケモンの詳細データを取得
        const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonEntry.id}`);
        setPokemonData({
          ...pokemonResponse.data,
          japaneseName: japaneseNameEntry.name,
        });
      } else {
        alert('ポケモンが見つかりませんでした。');
      }
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。');
    }
  };

  return (
    <div className="App">
      <h1>ポケモン検索アプリ</h1>
      <SearchForm onSearch={handleSearch} />
      {pokemonData && <PokemonCard pokemonData={pokemonData} />}
    </div>
  );
};

export default App;
