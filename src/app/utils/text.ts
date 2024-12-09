export const convertToSentenceCase = (str?: string) => {
    // using regex to convert to sentence case
    if (!str) return '';
    const result = str.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  };
  