// src/components/PokemonCard.tsx

import React, { useState } from 'react';

interface Props {
  pokemonData: any;
}

const PokemonCard: React.FC<Props> = ({ pokemonData }) => {
  const [evs, setEvs] = useState<{ [key: string]: number }>({});

  // 努力値を入力して最終的なステータスを計算
  const calculateStat = (base: number, ev: number) => {
    // シンプルな計算式（実際のゲームでは異なる場合があります）
    return Math.floor(((base + ev) * 2) / 100 + 5);
  };

  const handleEvChange = (statName: string, value: number) => {
    setEvs({
      ...evs,
      [statName]: value,
    });
  };

  return (
    <div>
      <h2>{pokemonData.name}</h2>
      <img src={pokemonData.sprites.front_default} alt={pokemonData.name} />

      {/* 能力値と努力値の入力 */}
      <h3>能力値</h3>
      <ul>
        {pokemonData.stats.map((stat: any) => (
          <li key={stat.stat.name}>
            {stat.stat.name}: {stat.base_stat}
            <input
              type="number"
              min="0"
              max="252"
              placeholder="努力値"
              value={evs[stat.stat.name] || ''}
              onChange={(e) => handleEvChange(stat.stat.name, Number(e.target.value))}
            />
            <span>
              最終値: {calculateStat(stat.base_stat, evs[stat.stat.name] || 0)}
            </span>
          </li>
        ))}
      </ul>

      {/* ドロップアイテムの表示 */}
      <h3>ドロップアイテム</h3>
      <ul>
        {pokemonData.held_items.map((item: any) => (
          <li key={item.item.name}>{item.item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default PokemonCard;
