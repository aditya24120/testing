import sendgrid from '@sendgrid/mail';
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export const sendgridInstance = sendgrid;

export const SENDGRID_TEMPLATE_IDS = {
  SUB_CREATED: 'd-54d0bb866de1467abc5c24eaec9f14ce',
  SUB_ENDED: 'd-532bdd9518104be6b0f6461a57b6d17d',
  PAYMENT_FAILED: 'd-3974df75d5bb40a4997d5f991357fc29'
} as const;

export const CLIPBOT_GMAIL_ADDRESS = 'clipbottv@gmail.com';
