export function cutTextToLength(str: string, maxLength: number) {
  if (!str) return;
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
}

export function firstLetterToUppercase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
