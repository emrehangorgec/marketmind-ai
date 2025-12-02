import { Resend } from 'resend';
import { WelcomeEmail } from './emails/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Skipping email sending.');
    return;
  }

  try {
    const data = await resend.emails.send({
      from: 'MarketMind <info@mymarketmind.net>',
      to: email,
      subject: 'Welcome to MarketMind AI',
      react: WelcomeEmail({ name }),
    });

    console.log('Welcome email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}
