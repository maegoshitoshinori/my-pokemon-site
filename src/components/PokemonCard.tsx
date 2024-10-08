//src/components/PokemonCard.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PokemonCard.css';

interface Props {
  pokemonData: any; // pokemonDataの型を適切に設定することが推奨されます
}

// 英語から日本語へのタイプ名のマッピング
const typeNameJPMap: { [key: string]: string } = {
  grass: 'くさ',
  poison: 'どく',
  fire: 'ほのお',
  water: 'みず',
  normal: 'ノーマル',
  flying: 'ひこう',
  bug: 'むし',
  rock: 'いわ',
  electric: 'でんき',
  psychic: 'エスパー',
  ice: 'こおり',
  ghost: 'ゴースト',
  dragon: 'ドラゴン',
  dark: 'あく',
  steel: 'はがね',
  fairy: 'フェアリー',
  fighting: 'かくとう',
  ground: 'じめん',
  // 必要に応じて追加
};

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

  // 英語から日本語への特性名のマッピング（必要に応じて追加）
  const [abilityNameJPMap, setAbilityNameJPMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchAbilitiesAndTypes = async () => {
      try {
        // 特性を取得し、日本語名をマッピング
        const abilityPromises = pokemonData.abilities.map(async (ab: any) => {
          const abilityResponse = await axios.get(ab.ability.url);
          const names = abilityResponse.data.names;
          const jpName = names.find((name: any) => name.language.name === 'ja-Hrkt')?.name;
          return { english: ab.ability.name, japanese: jpName || ab.ability.name };
        });

        const abilitiesData = await Promise.all(abilityPromises);
        const abilityMap: { [key: string]: string } = {};
        abilitiesData.forEach((ab: any) => {
          abilityMap[ab.english] = ab.japanese;
        });
        setAbilities(abilitiesData.map((ab: any) => ab.japanese));

        // タイプを取得し、日本語名をマッピング
        const typesList = pokemonData.types.map((type: any) => type.type.name);
        const typesJP = typesList.map((typeName: string) => typeNameJPMap[typeName] || typeName);
        setTypes(typesJP);
      } catch (error) {
        console.error('特性やタイプの取得に失敗しました。', error);
      }
    };

    fetchAbilitiesAndTypes();
  }, [pokemonData]);

  // 実数値を計算する関数（レベル50）
  const calculateStat = (base: number, ev: number, iv: number, level: number = 50, isHP: boolean = false) => {
    if (isHP) {
      return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
    } else {
      return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
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
    const totalEVs = Object.values(newEvs).reduce((sum, val) => sum + val, 0);
    if (totalEVs > 510) {
      alert('努力値の総合計は510を超えることはできません。');
      return;
    }
    setEvs(newEvs);
    setRemainingEVs(510 - totalEVs);
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

  // 各ステータスのEVを最大に振るハンドラー
  const maximizeEV = (statName: string) => {
    if (remainingEVs <= 0) {
      alert('これ以上努力値を振ることはできません。');
      return;
    }
    const currentEv = evs[statName] || 0;
    const available = 252 - currentEv;
    const toAdd = Math.min(available, remainingEVs);
    const newEvs = {
      ...evs,
      [statName]: currentEv + toAdd,
    };
    setEvs(newEvs);
    setRemainingEVs(remainingEVs - toAdd);
  };

  // 各ステータスのEVをリセットするハンドラー
  const resetEV = (statName: string) => {
    const currentEv = evs[statName] || 0;
    if (currentEv === 0) return;
    const newEvs = {
      ...evs,
      [statName]: 0,
    };
    setEvs(newEvs);
    setRemainingEVs(remainingEVs + currentEv);
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
        {types.map((typeNameJP, index) => {
          // 元の英語のタイプ名を取得（CSSクラス用）
          const englishType = Object.keys(typeNameJPMap).find(key => typeNameJPMap[key] === typeNameJP) || typeNameJP;
          return (
            <li key={index} className={`type ${englishType}`}>
              {typeNameJP}
            </li>
          );
        })}
      </ul>

      {/* 特性表示 */}
      <h3>特性</h3>
      <ul className="abilities">
        {abilities.map((abilityNameJP, index) => (
          <li key={index}>{abilityNameJP}</li>
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
                <span className="actual-stat">
                  実数値: {actualStat}
                </span>
                <button className="max-ev-button" onClick={() => maximizeEV(statName)}>努力値をマックス振る</button>
                <button className="reset-ev-button" onClick={() => resetEV(statName)}>リセット</button>
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
                <span className="required-ev">
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