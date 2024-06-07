// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://f62cb894729415ac9ca3366dc9a5598b@o4505857363804160.ingest.sentry.io/4505857366622208',
  environment: process.env.NODE_ENV,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  ignoreErrors: ['TRPCError: UNAUTHORIZED', 'no clips found, getting new clips']
});
