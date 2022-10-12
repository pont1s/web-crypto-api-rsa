import { SymbolType } from '@/types/TextTypes';

export const useCalculateCharacterFrequencyInText = (text: string): SymbolType[] => Object.entries(
  Array.from(text)
    .reduce<{ [key: string]: number }>((freq, symbol) => {
    // eslint-disable-next-line no-param-reassign
    freq[symbol] = (freq[symbol] || 0) + 1;
    return freq;
  }, {}),
).map(([symbol, numberOfOccurrencesInText]) => ({
  value: symbol,
  numberOfOccurrencesInText,
}));
