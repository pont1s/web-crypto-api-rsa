export const useCalculateEntropy = (text: string): number => Object.values(
  Array.from(text)
    .reduce<{ [key: string]: number }>((freq, symbol) => {
    // eslint-disable-next-line no-param-reassign
    freq[symbol] = (freq[symbol] || 0) + 1;
    return freq;
  }, {}),
).reduce((sum, freq) => sum - ((freq / text.length) * Math.log2(freq / text.length)), 0);
