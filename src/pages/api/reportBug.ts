import type { NextApiRequest, NextApiResponse } from 'next';
import { CLIPBOT_GMAIL_ADDRESS, sendgridInstance } from '../../libs/sendgrid';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { description, email }: { description: string; email: string } = req.body;
  if (!description || !email) return res.status(404).send({ message: 'Invalid report data' });

  if (req.method === 'POST') {
    try {
      await sendgridInstance.send({
        to: CLIPBOT_GMAIL_ADDRESS,
        from: CLIPBOT_GMAIL_ADDRESS,
        subject: `Clipbot bug report`,
        html: `
        <div>
          <span>Email: ${email}</span>
          <p>${description}</p>        
        </div>
        `
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ error: error.message });
    }

    res.status(200).send('report sent');
  } else {
    throw new Error(`The HTTP ${req.method} method is not supported at this route.`);
  }
}
