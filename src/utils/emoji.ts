import emojiRegex from 'emoji-regex';

export function removeEmojis(text: string): string {
  // Get the regular expression to match emojis
  const regex = emojiRegex();

  // Replace all matches with an empty string
  return text.replace(regex, '');
}
