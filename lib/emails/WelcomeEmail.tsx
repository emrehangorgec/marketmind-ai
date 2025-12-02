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

interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to MarketMind AI - Your Financial Intelligence Assistant</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to MarketMind, {name}!</Heading>
        <Text style={text}>
          Thank you for joining MarketMind. We are thrilled to have you on board.
        </Text>
        <Text style={text}>
          MarketMind harnesses the power of multi-agent AI to provide you with:
        </Text>
        <Section style={bulletPoints}>
          <Text style={bulletPoint}>• Real-time Market Data Analysis</Text>
          <Text style={bulletPoint}>• Technical & Fundamental Deep Dives</Text>
          <Text style={bulletPoint}>• Advanced Risk Assessment</Text>
          <Text style={bulletPoint}>• Comprehensive Investment Reports</Text>
        </Section>
        <Section style={btnContainer}>
          <Button style={button} href="https://mymarketmind.net/dashboard">
            Go to Dashboard
          </Button>
        </Section>
        <Text style={text}>
          Ready to make your next decisive move? Start your first analysis today.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          © 2025 MarketMind AI. All rights reserved.
          <br />
          <Link href="https://mymarketmind.net" style={link}>
            mymarketmind.net
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

const bulletPoints = {
  padding: '20px 0',
};

const bulletPoint = {
  ...text,
  margin: '4px 0',
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
