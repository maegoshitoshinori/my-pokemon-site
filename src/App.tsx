// src/App.tsx

import React, { useState } from 'react';
import SearchForm from './components/SearchForm';
import PokemonCard from './components/PokemonCard';
import axios from 'axios';

const App: React.FC = () => {
  const [pokemonData, setPokemonData] = useState<any>(null);

  const handleSearch = async (query: string) => {
    try {
      // ポケモン種別を取得（日本語名で検索）
      const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/?limit=10000`);
      const speciesList = speciesResponse.data.results;

      // 日本語名でフィルタリング
      let pokemonEntry = null;
      for (const species of speciesList) {
        const speciesDetail = await axios.get(species.url);
        const names = speciesDetail.data.names;
        const japaneseNameEntry = names.find((name: any) => name.language.name === 'ja-Hrkt');

        // 名前が一致する場合
        if (japaneseNameEntry && japaneseNameEntry.name === query) {
          pokemonEntry = speciesDetail.data;
          break;
        }

        // タイプで検索する場合
        const genera = speciesDetail.data.genera;
        const japaneseGenera = genera.find((genus: any) => genus.language.name === 'ja-Hrkt');
        if (japaneseGenera && japaneseGenera.genus.includes(query)) {
          pokemonEntry = speciesDetail.data;
          break;
        }
      }

      if (pokemonEntry) {
        // ポケモンの詳細データを取得
        const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonEntry.id}`);
        setPokemonData(pokemonResponse.data);
      } else {
        alert('ポケモンが見つかりませんでした。');
      }
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。');
    }
  };

  return (
    <div>
      <h1>ポケモン検索アプリ</h1>
      <SearchForm onSearch={handleSearch} />
      {pokemonData && <PokemonCard pokemonData={pokemonData} />}
    </div>
  );
};

export default App;
