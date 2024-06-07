import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { Readable } from 'stream';
import { getUserByIdWithAllAccounts, updateUserInDb } from '../../../libs/prisma/user';
import {
  CLIPBOT_GMAIL_ADDRESS,
  SENDGRID_TEMPLATE_IDS,
  sendgridInstance
} from '../../../libs/sendgrid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const productId = process.env.STRIPE_PRODUCT_ID;

const stripeApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const payload = buf.toString('utf8');
    const sig = req.headers['stripe-signature'] as string;

    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err: any) {
      console.log(err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('Stripe Event:', event);

    // * handle subscription events
    if (event.type.startsWith('customer.subscription')) {
      const eventData = event.data.object as Stripe.Subscription;
      const metadata = eventData.metadata;
      const item = eventData.items.data[0];

      const subType = Number(item.price.metadata.sub_type);
      const subTimeRange = Number(item.price.metadata.sub_time_range);

      // * validations
      if (item.plan.product !== productId) {
        console.error(
          `A stripe subscription was altered with an unsupported product. Sub ID: ${eventData.id}`
        );
      }

      if (!metadata.userId) {
        console.error(
          `A stripe subscription was altered with no userId metadata. Sub ID: ${eventData.id}`
        );

        return res.status(500).end();
      }

      // Add customer id and sub info to team when subscription is successfully created
      if (event.type === 'customer.subscription.created') {
        const updatedUser = await updateUserInDb(metadata.userId, {
          customer_id: eventData.customer as string,
          sub_id: eventData.id,
          sub_type: subType ?? undefined,
          sub_time_range: subTimeRange ?? undefined,
          sub_time_created: eventData.created,
          sub_current_start: eventData.current_period_start,
          sub_current_end: eventData.current_period_end,
          sub_status: eventData.status
        });

        if (updatedUser) {
          console.log('User updated for sub created event');

          // send sub-created email
          console.log('Sending sub-created email');
          sendgridInstance
            .send({
              to: updatedUser.email,
              from: CLIPBOT_GMAIL_ADDRESS,
              templateId: SENDGRID_TEMPLATE_IDS.SUB_CREATED
            })
            .catch((error) => {
              console.error(
                'An issue occurred while trying to send sub-created email. Error: ',
                error
              );
            });
        }
      }

      // Update subscription info for team when subscription status changes
      if (event.type === 'customer.subscription.updated') {
        const updatedUser = await updateUserInDb(metadata.userId, {
          sub_type: subType,
          sub_time_range: subTimeRange,
          sub_current_start: eventData.current_period_start,
          sub_current_end: eventData.current_period_end,
          sub_status: eventData.status
        });

        if (updatedUser) {
          console.log('User Updated for sub update event');
        }
      }

      // Remove sub info if subscription ends
      if (event.type === 'customer.subscription.deleted') {
        const updatedUser = await updateUserInDb(metadata.userId, {
          sub_current_start: eventData.current_period_start,
          sub_current_end: eventData.current_period_end,
          sub_status: eventData.status
        });

        if (updatedUser) {
          console.log('User updated for deleted subscription');

          // send sub-ended email
          sendgridInstance
            .send({
              to: updatedUser.email,
              from: CLIPBOT_GMAIL_ADDRESS,
              templateId: SENDGRID_TEMPLATE_IDS.SUB_ENDED
            })
            .catch((error) => {
              console.error(
                'An issue occurred while trying to send sub-ended email. Error: ',
                error
              );
            });
        }
      }
    }

    // * handle invoice events
    if (event.type.startsWith('invoice')) {
      const eventData = event.data.object as Stripe.Invoice;
      const lineItem = eventData.lines.data[0];
      const userId = lineItem.metadata.userId;

      // * validations
      if (!userId) {
        console.error(
          `A stripe invoice was altered with no userId metadata. Invoice ID: ${eventData.id}`
        );

        return res.status(500).end();
      }

      if (lineItem.plan?.product != productId) {
        return res.status(500).send('Unsupported product id');
      }

      if (event.type == 'invoice.payment_failed') {
        const user = await getUserByIdWithAllAccounts(userId);
        if (!user) {
          console.error('Could not find user');
          return res.status(500).send('Could not find user');
        }

        // send payment-failed email
        console.log('Sending payment-failed email');
        sendgridInstance
          .send({
            to: user.email,
            from: CLIPBOT_GMAIL_ADDRESS,
            templateId: SENDGRID_TEMPLATE_IDS.PAYMENT_FAILED
          })
          .catch((error) => {
            console.error(
              'An issue occurred while trying to send payment-failed email. Error: ',
              error
            );
          });
      }
    }

    res.setHeader('Allow', 'POST');
    return res.status(200).end();
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

export default stripeApiHandler;

export const config = {
  api: {
    bodyParser: false
  }
};

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}
