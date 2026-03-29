import crypto from 'crypto';
import { isProduction } from '../configEnv';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const getPaystackSecretKey = () => {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key && isProduction) {
    throw new Error('PAYSTACK_SECRET_KEY is required in production');
  }
  return key;
};

export const initializePaystackTransaction = async (params: {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, unknown>;
}) => {
  const key = getPaystackSecretKey();

  if (!key) {
    return {
      authorization_url: `https://checkout.paystack.com/mock-url-${params.reference}`,
      access_code: `mock-access-${params.reference}`,
      reference: params.reference,
      mocked: true,
    };
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      metadata: params.metadata || {},
    }),
  });

  const payload = await response.json();

  if (!response.ok || !payload?.status) {
    throw new Error(payload?.message || 'Failed to initialize Paystack transaction');
  }

  return payload.data;
};

export const verifyPaystackWebhookSignature = (rawBody: Buffer, signatureHeader?: string) => {
  const key = getPaystackSecretKey();
  if (!key || !signatureHeader) return false;

  const hash = crypto
    .createHmac('sha512', key)
    .update(rawBody)
    .digest('hex');

  return hash === signatureHeader;
};
