export function getFirstWord(text: string) {
  return text.split(' ')[0];
}
export function removeFirstWord(text: string) {
  return text.split(' ').splice(1).join(' ');
}
