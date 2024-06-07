import Stripe from 'stripe';

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createRouter } from './context';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripeAPI = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15'
});

const PRICES = [process.env.MONTHLY_PRICE_ID, process.env.YEARLY_PRICE_ID];
const YOUR_DOMAIN = process.env.BASE_URL;

export const stripeRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next();
  })
  .mutation('checkout', {
    input: z.object({
      type: z.number(),
      timeRange: z.number(),
      referral: z.string().nullish()
    }),
    async resolve({ ctx, input }) {
      //check you are on this team
      const session = await generateCheckout(
        input.type,
        input.timeRange,
        ctx.session?.user?.userId!,
        input.referral
      );
      return session;
    }
  })
  .mutation('portal', {
    input: z.string(),
    async resolve({ ctx, input }) {
      const session = await generateCustomerPortal(input);
      return session;
    }
  });

const generateCheckout = async (
  subType: number,
  timeRange: number,
  userId: string,
  referral?: string | null
) => {
  // type - 0 = starter, 1 = enterprise
  // timeRange - 0 = monthly, 1 = yearly
  let price = subType === 0 ? PRICES[timeRange] : PRICES[timeRange];

  const session = await stripeAPI.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${YOUR_DOMAIN}clips`,
    cancel_url: `${YOUR_DOMAIN}`,
    allow_promotion_codes: true,
    client_reference_id: referral || userId,
    subscription_data: {
      metadata: {
        userId: referral || userId
      }
    }
  });

  return session;
};

const generateCustomerPortal = async (customerId: string) => {
  const session = await stripeAPI.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${YOUR_DOMAIN}`
  });
  return session;
};
