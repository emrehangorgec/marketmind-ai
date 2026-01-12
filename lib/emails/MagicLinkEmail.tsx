import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Button,
  Hr,
  Link,
} from '@react-email/components';

interface MagicLinkEmailProps {
  url: string;
  host: string;
}

export const MagicLinkEmail = ({ url, host }: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Sign in to {host}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Sign in to {host}</Heading>
        <Text style={text}>
          Click the button below to sign in to your account.
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={url}>
            Sign in
          </Button>
        </Section>
        <Text style={text}>
          If you didn&apos;t request this email, you can safely ignore it.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          © 2025 MarketMind AI. All rights reserved.
          <br />
          <Link href={`https://${host}`} style={link}>
            {host}
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#000000',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const h1 = {
  color: '#10b981', // Emerald-500
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const text = {
  color: '#e2e8f0', // Slate-200
  fontSize: '16px',
  lineHeight: '26px',
};

const btnContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#10b981',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#334155',
  margin: '20px 0',
};

const footer = {
  color: '#94a3b8',
  fontSize: '12px',
  textAlign: 'center' as const,
};

const link = {
  color: '#10b981',
  textDecoration: 'underline',
};
