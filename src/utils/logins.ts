export const loginToTikTok = (redirectUrl: string = '') => {
  console.log('tiktok');
  //@ts-ignore
  window.location = `/api/tiktokAuth${redirectUrl}`;
};
