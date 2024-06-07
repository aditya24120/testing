import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <meta name="description" content="ClipbotTv automating uploading your twitch clips" />
        {/* <!-- Primary Meta Tags --> */}

        <meta
          name="title"
          content="Automatically upload your Twitch clips to TikTok and YouTube Shorts and grow overnight."
        />
        <meta
          name="description"
          content='"Before Clipbot I had 100,000 total views in 10 years. Clipbot broke that in one month."'
        />

        {/* <!-- Open Graph / Facebook --> */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://app.clipbot.tv/" />
        <meta
          property="og:title"
          content="Automatically upload your Twitch clips to TikTok and YouTube Shorts and grow overnight."
        />
        <meta
          property="og:description"
          content='"Before Clipbot I had 100,000 total views in 10 years. Clipbot broke that in one month."'
        />
        <meta
          property="og:image"
          content="https://clipbot.tv/lib_hFxGVkRJTRpiJeuZ/3wy83w5jz2swokne.png?w=1200&h=630&fit=crop"
        />

        {/* <!-- Twitter --> */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://app.clipbot.tv/" />
        <meta
          property="twitter:title"
          content="Automatically upload your Twitch clips to TikTok and YouTube Shorts and grow overnight."
        />
        <meta
          property="twitter:description"
          content='"Before Clipbot I had 100,000 total views in 10 years. Clipbot broke that in one month."'
        />
        <meta
          property="twitter:image"
          content="https://app.clipbot.tv/lib_hFxGVkRJTRpiJeuZ/3wy83w5jz2swokne.png?w=1200&h=630&fit=crop"
        ></meta>

        <link rel="icon" href="/assets/images/box-logo.png" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css"
          integrity="sha512-42kB9yDlYiCEfx2xVwq0q7hT4uf26FUgSIZBK8uiaEnTdShXjwr8Ip1V4xGJMg3mHkUt9nNuTDxunHF0/EgxLQ=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
