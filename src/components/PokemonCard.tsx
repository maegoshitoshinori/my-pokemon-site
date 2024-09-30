import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PokemonCard.css';

interface Props {
  pokemonData: any; // pokemonDataの型を適切に設定することが推奨されます
}

const PokemonCard: React.FC<Props> = ({ pokemonData }) => {
  const [evs, setEvs] = useState<{ [key: string]: number }>({});
  const [desiredStats, setDesiredStats] = useState<{ [key: string]: number }>({});
  const [remainingEVs, setRemainingEVs] = useState<number>(510);
  const [abilities, setAbilities] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [ivs, setIvs] = useState<{ [key: string]: number }>({
    hp: 31,
    attack: 31,
    defense: 31,
    'special-attack': 31,
    'special-defense': 31,
    speed: 31,
  });

  // 日本語のステータス名
  const statNameMap: { [key: string]: string } = {
    hp: '体力',
    attack: '攻撃力',
    defense: '防御力',
    'special-attack': '特攻',
    'special-defense': '特防',
    speed: '素早さ',
  };

  useEffect(() => {
    const fetchAbilitiesAndTypes = async () => {
      try {
        // 特性を取得
        const abilitiesList = pokemonData.abilities.map((ab: any) => ab.ability.name);
        setAbilities(abilitiesList);

        // タイプを取得
        const typesList = pokemonData.types.map((type: any) => type.type.name);
        setTypes(typesList);
      } catch (error) {
        console.error('特性やタイプの取得に失敗しました。', error);
      }
    };

    fetchAbilitiesAndTypes();
  }, [pokemonData]);

  // 実数値を計算する関数
  const calculateStat = (base: number, ev: number, iv: number, level: number = 50, isHP: boolean = false) => {
    if (isHP) {
      return Math.floor(((base * 2 + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
    } else {
      return Math.floor(((base * 2 + iv + Math.floor(ev / 4)) * level) / 100) + 5;
    }
  };

  const handleEvChange = (statName: string, value: number) => {
    let newValue = value;
    if (newValue < 0) newValue = 0;
    if (newValue > 252) newValue = 252;

    const newEvs = {
      ...evs,
      [statName]: newValue,
    };
    setEvs(newEvs);
    const totalEVs = Object.values(newEvs).reduce((sum, val) => sum + val, 0);
    setRemainingEVs(510 - totalEVs); // 残りの努力値を計算
  };

  const handleIvChange = (statName: string, value: number) => {
    let newValue = value;
    if (newValue < 0) newValue = 0;
    if (newValue > 31) newValue = 31;

    const newIvs = {
      ...ivs,
      [statName]: newValue,
    };
    setIvs(newIvs); // 個体値を更新
  };

  const handleDesiredStatChange = (statName: string, value: number) => {
    setDesiredStats({
      ...desiredStats,
      [statName]: value,
    });
  };

  const resetEVs = () => {
    setEvs({});
    setRemainingEVs(510); // 努力値をリセット
  };

  const calculateEVForDesiredStat = (base: number, desiredStat: number, iv: number, level: number = 50, isHP: boolean = false) => {
    let ev = 0;
    let currentStat = calculateStat(base, ev, iv, level, isHP);
    while (currentStat < desiredStat && ev <= 252) {
      ev += 4;
      currentStat = calculateStat(base, ev, iv, level, isHP);
    }
    return ev > 252 ? '不可能' : ev;
  };

  return (
    <div className="pokemon-card">
      <h2>{pokemonData.japaneseName}</h2>
      <img src={pokemonData.sprites.front_default} alt={pokemonData.japaneseName} />

      {/* タイプ表示 */}
      <h3>タイプ</h3>
      <ul className="types">
        {types.map((typeName, index) => (
          <li key={index} className={`type ${typeName}`}>
            {typeName}
          </li>
        ))}
      </ul>

      {/* 特性表示 */}
      <h3>特性</h3>
      <ul className="abilities">
        {abilities.map((abilityName, index) => (
          <li key={index}>{abilityName}</li>
        ))}
      </ul>

      {/* 残りの努力値 */}
      <h3>残りの努力値: {remainingEVs}</h3>
      <button className="reset-button" onClick={resetEVs}>努力値をリセット</button>

      {/* 能力値、努力値、個体値の入力 */}
      <h3>能力値</h3>
      <ul className="stats">
        {pokemonData.stats.map((stat: any) => {
          const statName = stat.stat.name;
          const isHP = statName === 'hp';
          const statLabel = statNameMap[statName] || statName;
          const baseStat = stat.base_stat;
          const currentEV = evs[statName] || 0;
          const currentIV = ivs[statName] !== undefined ? ivs[statName] : 31; // 個体値

          const actualStat = calculateStat(baseStat, currentEV, currentIV, 50, isHP);
          const desiredStat = desiredStats[statName];
          const requiredEV = desiredStat ? calculateEVForDesiredStat(baseStat, desiredStat, currentIV, 50, isHP) : '-';

          return (
            <li key={statName} className="stat-item">
              <div className="stat-header">
                <span className="stat-name">
                  <strong>{statLabel}：</strong>種族値{baseStat}
                </span>
              </div>
              <div className="stat-inputs">
                <label>
                  努力値:
                  <input
                    type="number"
                    min="0"
                    max="252"
                    placeholder="努力値"
                    value={currentEV}
                    onChange={(e) => handleEvChange(statName, Number(e.target.value))}
                  />
                </label>
                <label>
                  個体値:
                  <input
                    type="number"
                    min="0"
                    max="31"
                    placeholder="個体値"
                    value={currentIV}
                    onChange={(e) => handleIvChange(statName, Number(e.target.value))}
                  />
                </label>
                <span>
                  実数値: {actualStat}
                </span>
              </div>
              <div className="desired-stat">
                <label>
                  目標値:
                  <input
                    type="number"
                    min="0"
                    placeholder="目標値"
                    value={desiredStats[statName] || ''}
                    onChange={(e) => handleDesiredStatChange(statName, Number(e.target.value))}
                  />
                </label>
                <span>
                  必要努力値: {requiredEV}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PokemonCard;