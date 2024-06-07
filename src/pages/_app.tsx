import { withTRPC } from '@trpc/next';
import type { AppRouter } from '../server/router';
import type { AppType } from 'next/dist/shared/lib/utils';
import { UploadContext } from '../context/UploadContext';
import ClipProvider from '../context/ClipContext';
import { SessionProvider } from 'next-auth/react';
import superjson from 'superjson';
import '../styles/globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Router } from 'next/router';
import NProgress from 'nprogress';
import Head from 'next/head';
export { reportWebVitals } from 'next-axiom';

const MyApp: AppType = ({ Component, pageProps: { session, ...pageProps } }) => {
  NProgress.configure({ showSpinner: false });
  Router.events.on('routeChangeStart', () => NProgress.start());
  Router.events.on('routeChangeComplete', () => NProgress.done());
  return (
    <SessionProvider session={session}>
      <Head>
        <title>ClipbotTV</title>
      </Head>
      <ClipProvider>
        <UploadContext>
          <Component {...pageProps} />
        </UploadContext>
      </ClipProvider>
      <ToastContainer
        position="top-right"
        autoClose={8000}
        hideProgressBar={false}
        newestOnTop={false}
        draggable={false}
        pauseOnFocusLoss
        closeOnClick
        pauseOnHover
      />
    </SessionProvider>
  );
};

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '';
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;

    return {
      url,
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);
