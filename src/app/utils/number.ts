
export const getNumberFormater = (decimals: number) =>
    new Intl.NumberFormat('en-US', {
      maximumFractionDigits: decimals,
      maximumSignificantDigits: decimals > 8 ? 8 : decimals,
  
      useGrouping: true,
      notation: 'compact',
    });
  
const subscriptMap = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
  };
  
  
  
  export function getDisplayPriceWithShortedZeroes(price: string) {
    const priceStr = price;
  
    const [_integerPart, fractionalPart] = priceStr.split('.');
  
    if (!fractionalPart) {
      return priceStr;
    }
    const leadingZerosMatch = fractionalPart.match(/^0+/);
    const leadingZeros = leadingZerosMatch ? leadingZerosMatch[0].length : 0;
  
    if (!leadingZeros || leadingZeros < 5) return priceStr;
    const significantDigits = fractionalPart.slice(leadingZeros);
  
    const leadingZerosSubscript = leadingZeros
      .toString()
      .split('')
      .map((num) => {
        const digit = num as keyof typeof subscriptMap;
        return subscriptMap[digit] || digit;
      })
      .join('');
  
    return `0.0${leadingZerosSubscript}${significantDigits}`;
  }
  